var _db;
var cart = [];

function initFirebase() {
  _db = firebase.firestore();

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("user");
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var providerData = user.providerData;
      var uid = user.uid;

      $(`.logout`).css("display", "block");
      $(`.login-section`).css("display", "none");
      $(`.signup-section`).css("display", "none");
      document.getElementById(`authModal`).className = "logoutModal";
    } else {
      console.log("logged out");
    }
  });
}

function signup() {
  let fName = $("#fn").val();
  let lName = $("#ln").val();
  let email = $("#email").val();
  let password = $("#pw").val();

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      $("#fn").val("");
      $("#ln").val("");
      $("#email").val("");
      $("#pw").val("");
      // Signed in
      var user = userCredential.user;
      // ...
      console.log("account created");
      alert("Account Created");
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
      alert(errorMessage);
      console.log(errorMessage);
    });
}

function login() {
  console.log("logging in");
  let email = $("#liemail").val();
  let password = $("#lipw").val();

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      $("#liemail").val("");
      $("#lipw").val("");
      // Signed in
      var user = userCredential.user;
      alert("Login Successful");
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(errorMessage);
    });
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      $(`.logout`).css("display", "none");
      $(`.login-section`).css("display", "block");
      $(`.signup-section`).css("display", "block");
      document.getElementById(`authModal`).className = "";

      clearCart();
    })
    .catch((error) => {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}
// end firebase auth functions

function route() {
  let hash = window.location.hash;
  let pgID = hash.replace("#/", "");

  if (pgID == "" || pgID == "coffee") {
    MODEL.pgChange("coffee", coffeeData);
  } else {
    MODEL.pgChange(pgID, loadCart);
  }
}

function openAuth() {
  $(`#authModal`).css("display", "block");
}

function closeAuth() {
  $(`#authModal`).css("display", "none");
}

function showNav() {
  $(`.mobile-nav`).css("display", "flex");
  $(`.mobile-nav`).css("z-index", "99");
}

function hideNav() {
  $(`.mobile-nav`).css("display", "none");
  $(`.mobile-nav`).css("z-index", "-99");
}

function loadCart() {
  console.log(cart.length);
  if (cart.length == 0) {
    $(`.userCart`).css("flex-direction", "column");
    $(`.userCart`).html(`
        <p>0 Items</p>
        <h1>You don't have items in your shopping cart</h1>
        `);
  } else {
    let subtotal = 0;
    let tax = 0;

    $.each(cart, function (index, item) {
      subtotal = subtotal + item.price;
      tax = subtotal * 0.07;
    });

    $(`.userCart`).html(
      `<div class="productsContainer">
        <div class="header">
            <h1>Regular Purchases</h1>
            <p>These items will be processed today and ship right away</p>
        </div>
      </div>

      <div class="summary">
      <h1>Cart Summary</h1>
      <div class="prices">
        <p>Subtotal (${cart.length} item(s) ): $${subtotal.toFixed(2)}</p>
      </div>
      <div class="prices">
        <p>Shipping: FREE</p>
        <p>Total: $${(subtotal + tax).toFixed(2)}</p>
      </div>
      <div>
      <button onclick="clearCart()">Clear Cart</button>
      </div>
      </div>`
    );
    $.each(cart, function (index, item) {
      $(`.productsContainer`).append(`
      <div class="item">
      <div class="top">
      <button onclick="removeItem(${index})">x</button>
      </div>
      <div class="itemContent">
      <div class="itmbackground" style="background-image: url(../images/${item.image});"></div>
      <div class="name">
      <p>${item.name}</p>
      </div>
      <div class="cost">
      <p>$${item.price}</p>
      </div>
      </div>
      </div>
      `);
    });
  }
}

function removeItem(i) {
  cart.splice(i, 1);
  $(`.cartCounter`).html(`<p>${cart.length}</p>`);

  MODEL.pgChange("cart", loadCart);
}

function clearCart() {
  cart = [];
  $(`.cartCounter`).css("display", "none");
  MODEL.pgChange("cart", loadCart);
}

function updateCart(i) {
  let user = firebase.auth().currentUser;

  if (user) {
    $.getJSON("data/data.json", function (products) {
      cart.push(products.COFFEE_MACHINES[i]);
      cart.sort();
      console.log(cart);

      $(`.cartCounter`).css("display", "flex");
      $(`.cartCounter`).html(`<p>${cart.length}</p>`);
    });
  } else {
    window.alert("You need to sign in to purchase items");
  }
}

function coffeeData() {
  $.getJSON("data/data.json", function (products) {
    console.log(products);
    $.each(products.COFFEE_MACHINES, function (index, product) {
      //   console.log(product);
      $(".cardContainer").append(`
      <div class="card">
      <div class="cardImg" style='background-image: url(../images/${product.image});'></div>
      <div class="cardText">
        <div class="colors">
          <div class="swatch"></div>
        </div>
        <div class="cardName"><p>${product.name}</p></div>
        <div class="price"><p>$${product.price}</p></div>
        <button onclick="updateCart(${index})">BUY NOW</button>
      </div>
      
    </div>`);
    });
  });
}

function initListeners() {
  $(window).on("hashchange", route);
  route();

  $(`.mobile-menu a`).click(function (e) {
    hideNav();
  });
}

$(document).ready(function () {
  try {
    initListeners();
    initFirebase();
    console.log("working");
    hideNav();
  } catch {
    console.log("fail to start");
  }
});
