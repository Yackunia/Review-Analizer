import os
import json
from typing import Any, Dict
from flask_cors import CORS, cross_origin

from dotenv import load_dotenv
from flask import Flask, request, jsonify, abort
from openai import OpenAI

from utils import init_db, get_db_connection
from rss import register_rss_routes

# ── Load environment and init OpenAI client ─────────────────────────────────
load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Переменная окружения OPENAI_API_KEY не установлена")
client = OpenAI(api_key=api_key)


def extract_json(text: str):
    """Извлекает первый валидный JSON-объект или массив из произвольного текста."""
    text = text.strip()
    decoder = json.JSONDecoder()
    try:
        # пробуем сразу парсить весь текст
        return decoder.decode(text)
    except json.JSONDecodeError:
        idx = 0
        while idx < len(text):
            try:
                obj, end = decoder.raw_decode(text[idx:])
                # убедимся, что это объект или список
                if isinstance(obj, (dict, list)):
                    return obj
                idx += end
            except json.JSONDecodeError:
                idx += 1
        raise ValueError("В ответе модели не найден валидный JSON")


def generate_review_logic(name: str) -> Dict[str, Any]:
    """
    Генерирует обзор для name с помощью OpenAI.
    Возвращает dict с ключами:
      name, tagline, description, rating, reviewsCount, reviewsSummary
    """
    prompt = (
        f'Тебе передана строковая переменная query — это часть названия компании. '
        f'query = "{name}"\n\n'
        '1. Найди в открытых источниках (веб-сайты, базы, новостные статьи) до 10 компаний, '
        'названия которых содержат или близки к query. '
        '2. Для каждой компании сформируй краткий слоган (tagline) до 5 слов, отражающий суть деятельности. '
        '3. Отсортируй по релевантности: наиболее точное совпадение первым.'
        '4. Верни результат в формате JSON-массива от 2 до 10 объектов вида "[{"name":"...","tagline":"..."},...]"'
        '5. Выведи только JSON-массив без дополнительного текста.'
    )

    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
    )
    # у Responses API нет .choices – берем сразу output_text
    content = response.output_text
    result = extract_json(content)
    if isinstance(result, dict):
        # если вдруг модель вернула один объект, обернём в список
        return [result]
    return result  # уже список


# ── Flask app setup ─────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={
    r"/companies/*": {"origins": "*"},
    r"/generate-review": {"origins": "*"}
})
init_db()
register_rss_routes(app)


# ── GET /companies ──────────────────────────────────────────────────────────
@app.route('/companies', methods=['GET'])
@cross_origin()
def get_companies_by_name():
    name = request.args.get('name', '').strip()
    if not name:
        return jsonify([]), 200

    app.logger.debug(f"Searching for company: {name}")
    app.logger.debug(f"Database path: {os.getenv('DATABASE_PATH')}")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, tagline FROM companies WHERE LOWER(name) LIKE LOWER(?)",
        (f"%{name}%",)
    )
    rows = cur.fetchall()
    conn.close()

    if rows:
        return jsonify([
            {"ID": r["id"], "name": r['name'][0].upper() + r['name'][1:], "description": r["tagline"]}
            for r in rows
        ]), 200

    # Не нашли в БД — генерируем через OpenAI
    try:
        companies = generate_review_logic(name)
    except Exception as exc:
        return jsonify({
            "error": "Генерация не удалась",
            "details": str(exc)
        }), 502

    # Сохраняем все компании
    conn = get_db_connection()
    cur = conn.cursor()
    ids = []
    for comp in companies:
        cur.execute(
            """
            INSERT INTO companies
              (name, tagline, description, reviewsSummary, shortSummary, rating, reviewsCount, sources)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                comp.get("name"),
                comp.get("tagline"),
                comp.get("description"),
                comp.get("reviewsSummary"),
                comp.get("shortSummary"),
                comp.get("rating"),
                comp.get("reviewsCount"),
                json.dumps(comp.get("sources", [])),
            )
        )
        ids.append(cur.lastrowid)
    conn.commit()
    conn.close()

    # Возвращаем список новых компаний
    return jsonify([
        {
            "ID": ids[i],
            "name": companies[i]["name"][0].upper() + companies[i]["name"][1:],
            "description" : companies[i].get("tagline")
        }
        for i in range(len(companies))
    ]), 201

def generate_company_details(name: str) -> Dict[str, Any]:
    prompt = (
        f'Тебе будет передана строковая переменная name — это название организации или ФИО человека. '
        f'name = "{name}"\n\n'
        '1. Найди в открытых источниках (новости, пресса, соцсети, форумы, агрегаторы отзывов, судебные базы) '
        'максимально полную информацию о name. Это должна быть только организация или компания.'
        '2. Проанализируй тональность найденных отзывов и вычисли средний рейтинг по пятибалльной шкале (float с одной десятичной). '
        '3. Посчитай общее количество уникальных отзывов и комментариев, использованных в анализе. '
        '4. Составьте список уникальных ссылок на сайты‑источники всех собранных отзывов.\n'
        '5. Напиши официальный аналитический обзор отзывов без ссылок и лишней разметки. '
        '6. Напиши короткую версию обзора отзывов. '

        '7. Сформируй итог строго в формате валидного JSON-массива UTF‑8 без комментариев и дополнительного текста, в точном порядке полей:\n\n'
        '{\n'
        '    "name": "значение переменной name",\n'
        '    "tagline": "краткое описание (не более 10 слов)",\n'
        '    "description": "подробное описание деятельности (20‑30 слов)",\n'
        '    "rating": 0.0 (если отзывов по компании нет, то верни просто "?"),\n'
        '    "reviewsCount": 0,\n'
        '    "sources": [список из ссылок источников отзывов и доменов ссылок для каждого источника (всего не больше 10 элементов)] (возвращай источники в формате: [ссылка_0, домен_0, ссылка_1, домен_1, ...])\n'
        '    "reviewsSummary": "подробный аналитический обзор"\n'
        '    "shortSummary": "аналитический обзор в одном предложении"\n'
        '}\n\n'
        'Выведи только JSON. Отвечай на русском языке.'
    )

    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
    )
    obj = extract_json(response.output_text)
    if not isinstance(obj, dict):
        raise ValueError("Ожидался JSON-объект")
    return obj

@app.route('/companies/<int:company_id>', methods=['GET'])
@cross_origin()
def get_company_by_id(company_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM companies WHERE id = ?", (company_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Компания не найдена"}), 404

    # если нет tagline или description — подтягиваем детали
    if not row["tagline"] or not row["description"]:
        try:
            details = generate_company_details(row["name"])
            cur.execute(
                """
                UPDATE companies
                   SET tagline        = ?,
                       description    = ?,
                       rating         = ?,
                       reviewsCount   = ?,
                       sources        = ?,
                       reviewsSummary = ?,
                       shortSummary   = ?
                 WHERE id = ?
                """,
                (
                    details["tagline"],
                    details["description"],
                    details["rating"],
                    details["reviewsCount"],
                    json.dumps(details["sources"]),
                    details["reviewsSummary"],
                    details["shortSummary"],
                    company_id
                )
            )
            conn.commit()
            # обновить локальную копию row
            row = {**row,
                   "tagline": details["tagline"],
                   "description": details["description"],
                   "rating": details["rating"],
                   "reviewsCount": details["reviewsCount"],
                   "sources": json.dumps(details["sources"]),
                   "reviewsSummary": details["reviewsSummary"],
                   "shortSummary": details["shortSummary"]}
        except Exception as e:
            conn.close()
            return jsonify({"error": "Не удалось получить детали", "details": str(e)}), 502

    conn.close()
    return jsonify({
        "ID":            row["id"],
        "name":          row["name"],
        "tagline":       row["tagline"],
        "description":   row["description"],
        "rating":        row["rating"],
        "reviewsCount":  row["reviewsCount"],
        "sources":       json.loads(row["sources"] or "[]"),
        "reviewsSummary": row["reviewsSummary"],
        "shortSummary":   row["shortSummary"],
    }), 200



# ── GET /companies/<id>/analyze ──────────────────────────────────────────────
@app.route('/companies/<int:company_id>/analyze', methods=['GET'])
@cross_origin()
def analyze_company(company_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Получаем компанию
    cur.execute("SELECT reviewsSummary, sources FROM companies WHERE id = ?", (company_id,))
    comp = cur.fetchone()
    conn.close()

    if not comp:
        return jsonify({"error": "Компания не найдена"}), 404

    return jsonify([comp["reviewsSummary"],
                    '\n'.join(json.loads(comp["sources"] or "[]"))
                    ]), 200


# ── Optional: keep /generate-review route if needed ─────────────────────────
@app.post("/generate-review")
@cross_origin()
def generate_review():
    if not request.is_json:
        abort(415, "Требуется Content-Type: application/json")
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        abort(400, "Поле 'name' обязательно")
    if len(name) > 200:
        abort(400, "Поле 'name' слишком длинное")

    try:
        result = generate_review_logic(name)
    except Exception as exc:
        abort(502, f"Генерация не удалась: {exc}")

    return jsonify(result), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5233, debug=True, threaded=True)