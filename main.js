import clamp from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/clamp.js/+esm";

render(document.getElementById("bart"), {
  fares: await fetch("agencies/bart.json").then((r) => r.json()),
  width: 50,
  minfare: 240,
  maxfare: 1200,
});

render(document.getElementById("wmata"), {
  fares: await fetch("agencies/wmata.json").then((r) => r.json()),
  width: 98,
  minfare: 225,
  maxfare: 675,
});

/**
 * @param {HTMLCanvasElement} canvas
 * @param {*} fares
 */
function render(canvas, agency) {
  const ctx = canvas.getContext("2d");

  const fromHint = document.createElement("span");
  fromHint.style.display = "none";
  fromHint.classList.add("hint", "fromHint");
  canvas.parentElement.appendChild(fromHint);
  const toHint = document.createElement("span");
  toHint.style.display = "none";
  toHint.classList.add("hint", "toHint");
  canvas.parentElement.appendChild(toHint);

  const squareSize = canvas.width / agency.width;

  agency.fares.forEach((trip, index) => {
    ctx.fillStyle = `hsl(${Math.round(
      ((clamp(trip.fare, agency.minfare, Infinity) - agency.maxfare) /
        (agency.minfare - agency.maxfare)) *
        100
    )} 70% 60%)`;

    ctx.fillRect(
      Math.floor((index * squareSize) % canvas.width),
      Math.floor(Math.floor(index / agency.width) * squareSize),
      squareSize + 1,
      squareSize + 1
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    const index = Math.floor(
      clamp(e.offsetX, 0, 499) / squareSize +
        Math.floor(e.offsetY / squareSize) * agency.width
    );

    const trip = agency.fares[index];
    const formattedFare = (trip.fare / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    // XSS haven
    document.querySelector(
      `#${canvas.id} + .info`
    ).innerHTML = `${formattedFare} | <strong>${trip.from}</strong> to ${
      trip.to == trip.from ? "itself" : `<strong>${trip.to}</strong>`
    }`;

    const bounding = canvas.getBoundingClientRect();

    fromHint.style.display = "block";
    fromHint.innerText = trip.from;
    fromHint.style.right = window.innerWidth - bounding.left + 5;
    fromHint.style.top =
      bounding.top + Math.floor(e.offsetY / squareSize) * squareSize;

    toHint.style.display = "block";
    toHint.innerText = trip.to;
    toHint.style.bottom = window.innerHeight - bounding.top;
    toHint.style.left =
      Math.floor(e.offsetX / squareSize) * squareSize + bounding.left;
  });

  canvas.addEventListener("mouseleave", () => {
    fromHint.style.display = "none";
    toHint.style.display = "none";

    document.querySelector(
      `#${canvas.id} + .info`
    ).innerText = `Hover over a square`;
  });
}
