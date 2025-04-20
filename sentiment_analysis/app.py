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


def extract_json(text: str) -> Dict[str, Any]:
    """Извлекает первый валидный JSON‑объект из произвольного текста."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        decoder = json.JSONDecoder()
        idx = 0
        while idx < len(text):
            try:
                obj, _ = decoder.raw_decode(text[idx:])
                return obj
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
        f'Тебе будет передана строковая переменная name — это название организации или ФИО человека. '
        f'name = "{name}"\n\n'
        '1. Найди в открытых источниках (новости, пресса, соцсети, форумы, агрегаторы отзывов, судебные базы) '
        'максимально полную информацию о name. '
        '2. Особое внимание удели негативным упоминаниям (скандалы, судебные иски, критика, отрицательные отзывы). '
        '3. Проанализируй тональность найденных отзывов и вычисли средний рейтинг по пятибалльной шкале (float с одной десятичной). '
        '4. Посчитай общее количество уникальных отзывов и комментариев, использованных в анализе. '
        '5. Составьте список уникальных ссылок на сайты‑источники всех собранных отзывов.\n'
        '6. Напиши официальный аналитический обзор отзывов без ссылок и лишней разметки. '
        '7. Напиши короткую версию обзора отзывов. '
        '8. Сформируй итог строго в формате валидного JSON UTF‑8 без комментариев и дополнительного текста, в точном порядке полей:\n\n'
        '{\n'
        '    "name": "значение переменной name",\n'
        '    "tagline": "краткое описание (не более 10 слов)",\n'
        '    "description": "подробное описание деятельности (20‑30 слов)",\n'
        '    "rating": 0.0,\n'
        '    "reviewsCount": 0,\n'
        '    "sources": [список URL‑источников отзывов (не больше 5)]\n'
        '    "reviewsSummary": "подробный аналитический обзор"\n'
        '    "shortSummary": "аналитический обзор в одном предложении"\n'
        '}\n\n'
        'Выведи только JSON. Отвечай на русском языке.'
    )

    completion = client.chat.completions.create(
        model="o4-mini",
        messages=[
            {"role": "system", "content": "Ты — ассистент по бэкграунд‑чеку."},
            {"role": "user", "content": prompt},
        ],
    )
    content = completion.choices[0].message.content.strip()
    return extract_json(content)


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
        "SELECT id, name, description FROM companies WHERE LOWER(name) LIKE LOWER(?)",
        (f"%{name}%",)
    )
    rows = cur.fetchall()
    conn.close()

    if rows:
        return jsonify([
            {"ID": r["id"], "name": r['name'][0].upper() + r['name'][1:], "description": r["description"]}
            for r in rows
        ]), 200

    # Не нашли — генерируем через OpenAI
    try:
        company_data = generate_review_logic(name)
    except Exception as exc:
        return jsonify({
            "error": "Генерация не удалась",
            "details": str(exc)
        }), 502

    # Сохраняем в БД
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO companies
              (name, tagline, description, reviewsSummary, shortSummary, rating, reviewsCount, sources)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                company_data["name"],
                company_data.get("tagline"),
                company_data.get("description"),
                company_data.get("reviewsSummary"),
                company_data.get("shortSummary"),
                company_data.get("rating"),
                company_data.get("reviewsCount"),
                json.dumps(company_data.get("sources", [])),
            )
        )
        new_id = cur.lastrowid
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({
            "error": "Ошибка сохранения в БД",
            "details": str(e)
        }), 500
    conn.close()

    return jsonify([{
        "ID": new_id,
        "name": company_data['name'][0].upper() + company_data['name'][1:],
        "tagline": company_data.get("tagline"),
        "description": company_data.get("description"),
        "shortSummary": company_data.get("shortSummary"),
        "rating": company_data.get("rating"),
        "reviewsCount": company_data.get("reviewsCount")
    }]), 201


# ── GET /companies/<id> ─────────────────────────────────────────────────────
@app.route('/companies/<int:company_id>', methods=['GET'])
@cross_origin()
def get_company_by_id(company_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM companies WHERE id = ?", (company_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Компания не найдена"}), 404

    return jsonify({
        "ID": row['id'],
        "name": row['name'][0].upper() + row['name'][1:],
        "tagline": row['tagline'],
        "description": row['description'],
        "reviewsSummary": row['shortSummary'],
        "shortSummary": row['shortSummary'],
        "rating": row['rating'],
        "logoUrl": row['logoUrl'],
        "reviewsCount": row['reviewsCount']
    })


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
