import requests
from bs4 import BeautifulSoup
from flask import request, jsonify

from utils import get_db_connection

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8"
}

def clean_text(text):
    return " ".join(text.split()) if text else None

def parse_instagram(username):
    if not username:
        return None
    url = f"https://www.instagram.com/{username}/?__a=1&__d=dis"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            bio = data.get("graphql", {}).get("user", {}).get("biography")
            return bio.strip() if bio else None
    except Exception:
        pass
    return None

def parse_telegram(channel):
    if not channel:
        return None
    url = f"https://t.me/s/{channel.lstrip('@')}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        d = soup.find("div", class_="tgme_page_description")
        return clean_text(d.text) if d else None
    except Exception:
        pass
    return None

def parse_twitter(username):
    if not username:
        return None
    url = f"https://nitter.net/{username}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        bio = soup.find("div", class_="profile-bio")
        return clean_text(bio.text) if bio else None
    except Exception:
        pass
    return None

def parse_ozon(name):
    if not name:
        return None
    url = f"https://www.ozon.ru/search/?text={name}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        return clean_text(soup.title.text) if soup.title else None
    except Exception:
        pass
    return None

def parse_wildberries(name):
    if not name:
        return None
    url = f"https://www.wildberries.ru/catalog/0/search.aspx?search={name}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        return clean_text(soup.title.text) if soup.title else None
    except Exception:
        pass
    return None

def gather_company_data(name, instagram, telegram, twitter):
    ozon_desc  = parse_ozon(name)
    insta_desc = parse_instagram(instagram)
    tg_desc    = parse_telegram(telegram)
    tw_desc    = parse_twitter(twitter)
    wb_desc    = parse_wildberries(name)

    summary = (
        f"Ozon: {ozon_desc or '—'}\n"
        f"Instagram: {insta_desc or '—'}\n"
        f"Telegram: {tg_desc or '—'}\n"
        f"Twitter: {tw_desc or '—'}\n"
        f"Wildberries: {wb_desc or '—'}"
    )
    full_desc = f"Собранные данные:\n{summary}"

    return summary, full_desc, {
        "ozon": ozon_desc,
        "instagram": insta_desc,
        "telegram": tg_desc,
        "twitter": tw_desc,
        "wildberries": wb_desc
    }

def register_rss_routes(app):
    @app.route('/companies', methods=['POST'])
    def add_company():
        data  = request.get_json() or {}
        name  = data.get('name')
        insta = data.get('instagram')
        tg    = data.get('telegram')
        tw    = data.get('twitter')

        if not name:
            return jsonify({"error": "Поле 'name' обязательно"}), 400

        summary, full_desc, revs = gather_company_data(name, insta, tg, tw)
        conn = get_db_connection()
        cur  = conn.cursor()
        try:
            # Insert into companies (оставляем остальные поля NULL)
            cur.execute(
                "INSERT INTO companies (name, description, reviewsSummary) VALUES (?, ?, ?)",
                (name, full_desc, summary)
            )
            company_id = cur.lastrowid

            # Insert into reviews table with id = company_id
            cur.execute(
                "INSERT INTO reviews (id, ozon, instagram, telegram, twitter, wildberries) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    company_id,
                    revs['ozon'],
                    revs['instagram'],
                    revs['telegram'],
                    revs['twitter'],
                    revs['wildberries']
                )
            )

            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": "Ошибка сохранения", "details": str(e)}), 500
        finally:
            conn.close()

        return jsonify({"message": "OK", "id": company_id, "name": name}), 201
