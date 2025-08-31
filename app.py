from flask import Flask, request, jsonify, render_template
import re
import random

app = Flask(__name__)

# ----------------- DATA -----------------
shopping_list = []

catalog = {
    "milk": {"category": "Dairy", "substitutes": ["Almond Milk", "Soy Milk"]},
    "apples": {"category": "Produce", "substitutes": ["Bananas", "Pears"]},
    "bread": {"category": "Bakery", "substitutes": ["Whole Wheat Bread", "Multigrain Bread"]},
    "eggs": {"category": "Poultry", "substitutes": ["Free-range Eggs"]},
    "rice": {"category": "Grains", "substitutes": ["Quinoa", "Brown Rice"]},
    "cookies": {"category": "Snacks", "substitutes": ["Biscuits", "Granola Bars"]},
    "cheese": {"category": "Dairy", "substitutes": ["Paneer", "Cottage Cheese"]}
}

# ----------------- HELPERS -----------------
def parse_command(text):
    text = text.lower().strip()
    qty_match = re.search(r"(\d+)", text)
    qty = int(qty_match.group(1)) if qty_match else 1

    if "add" in text or "buy" in text or "need" in text:
        for item in catalog:
            if item in text:
                return {"action": "add", "item": item, "qty": qty}
        return {"action": "add", "item": text.replace("add", "").strip(), "qty": qty}

    elif "remove" in text or "delete" in text:
        for item in catalog:
            if item in text:
                return {"action": "remove", "item": item}
        return {"action": "remove", "item": text.replace("remove", "").strip()}

    elif "find" in text or "search" in text:
        price_match = re.search(r"under (\d+)", text)
        max_price = int(price_match.group(1)) if price_match else None
        return {"action": "find", "item": text.replace("find", "").replace("search", "").strip(), "price": max_price}

    return {"action": "unknown", "item": text}

def suggest_items():
    suggestions = []
    if any("bread" in i["item"].lower() for i in shopping_list):
        suggestions.append("You often buy bread. Do you need butter too?")
    seasonal = random.choice(["Mangoes are in season 🍋", "Strawberries are fresh now 🍓", "Pumpkins are on sale 🎃"])
    suggestions.append(seasonal)
    return suggestions

# ----------------- ROUTES -----------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/command", methods=["POST"])
def command():
    global shopping_list
    data = request.get_json()
    text = data.get("text", "")
    parsed = parse_command(text)

    response = {"message": "", "list": shopping_list}

    if parsed["action"] == "add":
        item = parsed["item"]
        qty = parsed["qty"]
        cat = catalog.get(item, {}).get("category", "Misc")
        shopping_list.append({"item": item.title(), "qty": qty, "category": cat})
        response["message"] = f"✅ Added {qty} {item}"

    elif parsed["action"] == "remove":
        item = parsed["item"]
        shopping_list = [i for i in shopping_list if i["item"].lower() != item.lower()]
        response["list"] = shopping_list
        response["message"] = f"🗑 Removed {item}"

    elif parsed["action"] == "find":
        item = parsed["item"]
        price = parsed.get("price")
        msg = f"🔎 Searching for {item}"
        if price:
            msg += f" under ₹{price}"
        subs = catalog.get(item, {}).get("substitutes", [])
        if subs:
            msg += f". Alternatives: {', '.join(subs)}"
        response["message"] = msg

    else:
        response["message"] = "❓ Sorry, I didn’t understand that."

    response["suggestions"] = suggest_items()
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
