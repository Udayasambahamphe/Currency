from flask import Flask, render_template, request
import requests
import time

app = Flask(__name__)

API_URL = "https://open.er-api.com/v6/latest/USD"

rates_cache = {}
last_fetch_time = 0
CACHE_DURATION = 60 * 60   

def get_currencies_and_rates():
    global rates_cache, last_fetch_time

    if time.time() - last_fetch_time > CACHE_DURATION or not rates_cache:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        rates_cache = data["rates"]
        last_fetch_time = time.time()

    return rates_cache

@app.route("/", methods=["GET", "POST"])
def index():
    rates = get_currencies_and_rates()
    currencies = sorted(rates.keys())

    result = None
    amount = ""
    from_currency = "USD"
    to_currency = "NPR"

    if request.method == "POST":
      data = request.get_json()

      amount = float(data["amount"])
      from_currency = data["from_currency"]
      to_currency = data["to_currency"]

      usd_amount = amount / rates[from_currency]
      result = usd_amount * rates[to_currency]


    return render_template(
        "index.html",
        currencies=currencies,
        result=round(result, 2) if result else None,
        amount=amount,
        from_currency=from_currency,
        to_currency=to_currency
    )

if __name__ == "__main__":
    # EC2: listen on all interfaces, port 8000
    app.run(host="0.0.0.0", port=8000, debug=False)
