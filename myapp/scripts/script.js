const cartItems = [
  { name: "باراسيتامول", quantity: 2, price: 10 },
  { name: "فيتامين C", quantity: 1, price: 25 }
];

function renderCart() {
  const cartUl = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total-price");

  let total = 0;
  cartItems.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} × ${item.quantity} = ${item.quantity * item.price} ريال`;
    cartUl.appendChild(li);
    total += item.quantity * item.price;
  });

  totalSpan.textContent = total;
}

document.getElementById("place-order").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("الرجاء إدخال جميع البيانات");
    return;
  }

  const orderPayload = {
    customerName: name,
    customerEmail: email,
    items: cartItems,
  };

  try {
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    document.getElementById("status-message").textContent =
      data.success ? "تم إنشاء الطلب بنجاح، جارٍ تحويلك للدفع..." : "حدث خطأ أثناء تنفيذ الطلب";

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl; // انتقال إلى صفحة الدفع (Moyasar)
    }
  } catch (err) {
    console.error(err);
    document.getElementById("status-message").textContent = "فشل الاتصال بالسيرفر.";
  }
});

renderCart();