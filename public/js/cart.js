let ShoppingCart = document.getElementById("shopping-cart");
let label = document.getElementById("label");

let shopItemsData = [];

/*
 * ! Basket to hold all the selected items
 * ? the getItem part is retrieving data from the local storage
 * ? if local storage is blank, basket becomes an empty array
 */

let basket = JSON.parse(localStorage.getItem("data")) || [];

let getSignedProducts = async function() {
  try {
      const response = await fetch('/api/products');
      if (!response.ok) {
            throw new Error('Unable to fetch product data');
          }
      const shopData = await response.json();
      shopItemsData = shopData;
      
      
      generateCartItems();
    } catch (error) {
      console.error(error);
  }
};
getSignedProducts();




/**
 * ! To calculate total amount of selected Items
 */

let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  cartIcon.innerHTML = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
};

calculation();

/**
 * ! Generates the Cart Page with product cards composed of
 * ! images, title, price, buttons, & Total price
 * ? When basket is blank -> show's Cart is Empty
 */

let generateCartItems = () => {
  if (basket.length !== 0) {
    return (ShoppingCart.innerHTML = basket
      .map((x) => {
        let { id, item } = x;
        let search = shopItemsData.find((x) => x.id === id) || [];
        let { imageUrl, price, name } = search;
        return `
      <div class="cart-item">
        <img width="100" src=${search.imageUrl} alt="" />

        <div class="details">
        
          <div class="title-price-x">
            <h4 class="title-price">
              <p>${search.name}</p>
              <p class="cart-item-price">$ ${price}</p>
            </h4>
            <i onclick="removeItem(${id})" class="bi bi-x-lg"></i>
          </div>

          <div class="cart-buttons">
            <div class="buttons">
              <i onclick="decrement(${id})" class="bi bi-dash-lg"></i>
              <div id=${id} class="quantity">${x.item}</div>
              <i onclick="increment(${id})" class="bi bi-plus-lg"></i>
            </div>
          </div>

          <h3>$ ${item * price}</h3>
        
        </div>
      </div>
      `;
      })
      .join(""));
  } else {
    ShoppingCart.innerHTML = "";
    label.innerHTML = `
    <h2>Cart is Empty</h2>
    <a href="/dashboard">
      <button class="HomeBtn">Back to Home</button>
    </a>
    `;
  }
};

generateCartItems();

/**
 * ! used to increase the selected product item quantity by 1
 */

let increment = (id) => {
  let search = basket.find((x) => x.id === id);

  if (search === undefined) {
    basket.push({
      id,
      item: 1,
    });
  } else {
    search.item += 1;
  }

  generateCartItems();
  update(id);
  localStorage.setItem("data", JSON.stringify(basket));
};

/**
 * ! used to decrease the selected product item quantity by 1
 */

let decrement = (id) => {
  let search = basket.find((x) => x.id === id);

  if (search === undefined) return;
  else if (search.item === 0) return;
  else {
    search.item -= 1;
  }

  update(id);
  basket = basket.filter((x) => x.item !== 0);
  generateCartItems();
  localStorage.setItem("data", JSON.stringify(basket));
};

/**
 * ! To update the digits of picked items on each item card
 */

let update = (id) => {
  let search = basket.find((x) => x.id === id);
  document.getElementById(id).innerHTML = search.item;
  calculation();
  TotalAmount();
};

/**
 * ! Used to remove 1 selected product card from basket
 * ! using the X [cross] button
 */

let removeItem = (id) => {
  basket = basket.filter((x) => x.id !== id);
  calculation();
  generateCartItems();
  TotalAmount();
  localStorage.setItem("data", JSON.stringify(basket));
};

/**
 * ! Used to calculate total amount of the selected Products
 * ! with specific quantity
 * ? When basket is blank, it will show nothing
 */

let TotalAmount = () => {
  
  if (basket.length !== 0) {
    let amount = basket.map((x) => {
        let { id, item } = x;
	    
        let filterData = basket.find((x) => x.id === id);
        
	return filterData.price * item;

      })
      .reduce((x, y) => x + y, 0);
	  

    return (label.innerHTML = `
<!--    <div style="justify-content: center; padding-left: 50%; padding-right: 50%;"> -->
    <div style="justify-content: center; padding-left: 40%;"><h2>Total Bill : $ ${amount}</h2>
    <button onclick="href=/checkout" class="checkout" style="justify-content: center;">Checkout</button>
    <button onclick="clearCart()" class="removeAll" style="justify-content: center;">Clear Cart</button>
    </div>
    `);
  } else return;
	const bill = amount;
};

TotalAmount();

/**
 * ! Used to clear cart, and remove everything from local storage
 */

let clearCart = () => {
  basket = [];
  generateCartItems();
  calculation();
  localStorage.setItem("data", JSON.stringify(basket));
};
