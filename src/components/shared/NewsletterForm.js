const handleSubmit = async (event) => {
  event.preventDefault();
  const email = event.target.email.value;
  await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  alert("Subscribed successfully!");
};
