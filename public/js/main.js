let shop = document.getElementById("shop");

//const shopData = getSignedProducts;

/**
 * ! Basket to hold all the selected items
 * ? the getItem part is retrieving data from the local storage
 * ? if local storage is blank, basket becomes an empty array
 */

let basket = JSON.parse(localStorage.getItem("data")) || [];
/**
 * ! Generates the shop with product cards composed of
 * ! images, title, price, buttons, description
 */

let generateShop = () => {
  return (shop.innerHTML = shopItemsData.map((productx) => {
      let { id, name, desc, img, price } = productx;
      let search = basket.find((y) => y.id === id) || [];
      
      return `
    <div id=product-id-${productx.id} class="item">
      <img width="220" src=${productx.img} alt="">
      <div class="details">
        <h3>${productx.name}</h3>
        <p>${productx.desc}</p>
        <div class="price-quantity">
          <h2>$ ${productx.price} </h2>
          <div class="buttons">
            <i onclick="decrement(${productx.id})" class="bi bi-dash-lg"></i>
            <div id=${productx.id} class="quantity">${
        search.item === undefined ? 0 : search.item
      }</div>
            <i onclick="increment(${productx.id})" class="bi bi-plus-lg"></i>
          </div>
        </div>
      </div>
  </div>
    `;
    })
    .join(""));
};

generateShop();

/**
 * ! used to increase the selected product item quantity by 1
 */

let increment = (id) => {
  //let selectedItem = id;
  let search = basket.find((x) => x.id === id);

  if (search === undefined) {
    basket.push({
      id,
      item: 1,
    });
  } else {
    search.item += 1;
  }

  console.log(basket);
  update(id);
  localStorage.setItem("data", JSON.stringify(basket));
};

/**
 * ! used to decrease the selected product item quantity by 1
 */

let decrement = (id) => {
  //let selectedItem = id;
  let search = basket.find((x) => x.id === id);

  if (search === undefined) return;
  else if (search.item === 0) return;
  else {
    search.item -= 1;
  }

  update(id);
  basket = basket.filter((x) => x.item !== 0);
  console.log(basket);
  localStorage.setItem("data", JSON.stringify(basket));
  //console.log('basket');
};

/**
 * ! To update the digits of picked items on each item card
 */

let update = (id) => {
  let search = basket.find((x) => x.id == id);
  document.getElementById(id).innerHTML = search.item;
  calculation();
};

/**
 * ! To calculate total amount of selected Items
 */

let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  cartIcon.innerHTML = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
};

calculation();
