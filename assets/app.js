document.addEventListener('DOMContentLoaded', function() {
  const listProductHTML = document.querySelector('.list-sounds');
  const listCartHTML = document.querySelector('.list-cart-sounds');
  const blockIconCart = document.querySelector('.block-icon-cart');
  const numberItemCart = document.querySelector('.block-icon-cart .number-sound-cart');
  const body = document.querySelector('body');
  const btnCloseCart = document.querySelector('.block-bottom-tab .btn-close');
  const btnExportFile = document.querySelector('.block-bottom-tab .btn-export');
  let products = [];
  let carts = [];

  // SHOW/HIDE CART TAB
  blockIconCart.addEventListener('click', () => {
    body.classList.toggle('showCartTab');
  });
  
  btnCloseCart.addEventListener('click', () => {
    body.classList.toggle('showCartTab');
  });

  // COMMON FUNCTION 
  const findItemInProductListHTML = (id) => {
    if (!id) return;
    return document.querySelector(`.item-sound[data-id="${id}"]`);
  };

  const findIndexOfItemInCarts = (product_id) => {
    if (!product_id) return;
    return carts.findIndex((cart) => Number(cart.product_id) === Number(product_id));
  };

  const findIndexItemInProducts = (product_id) => {
    if (!product_id) return;
    return products.findIndex((x) => Number(x.id) === Number(product_id));
  };

  const findItemInProducts = (product_id) => {
    if (!product_id) return;
    return products.find((x) => Number(x.id) === Number(product_id));
  };

  const notificationNotFoundProduct = () => {
    createToast('error', 'fa-solid fa-circle-exclamation', 'Lỗi', 'Không tìm thấy sản phẩm tương ứng');
    return;
  };

  const scollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const saveDataCart = () => {
    localStorage.setItem('carts', JSON.stringify(carts));
  };

  // SHOW LIST PRODUCT IN HTML
  const addDataToHTML = () => {
    if(products.length > 0) 
    {
      products.forEach(product => {
        let newProduct = document.createElement('div');
        newProduct.dataset.id = product.id;
        newProduct.classList.add('item-sound');
        newProduct.innerHTML = 
        `
          <div class="wrapper-image">
            <img src="${product.image}" alt="">
          </div>
          <div class="wrapper-content">
            <h3 class="title">${product.name}</h3>
            <p class="quantity">Số lượng: ${Number(product.quantity)}</p>
          </div>
          <button class="btn-add-to-cart" data-id="${product.id}">Thêm vào giỏ</button>
        `;
        listProductHTML.appendChild(newProduct);
      });

      const btnsAddToCart = document.querySelectorAll('.btn-add-to-cart');
      btnsAddToCart.forEach(btn => {
        btn.addEventListener('click', function(event) {
          const clickedButton = event.target;
          const dataId = clickedButton.dataset.id;
          if (dataId) {
            const itemSound = findItemInProductListHTML(dataId);
            if (itemSound) {
              addToCart(dataId);
            }
            else {
              notificationNotFoundProduct();
              scollToTop();
            }
          }
          else {
            notificationNotFoundProduct();
            scollToTop();
          }
        });
      });
    }
  };

  // ADD PRODUCT IN CART
  const addToCart = (product_id) => {
    const positionThisProductInCart = findIndexOfItemInCarts(product_id);
    if (carts.length <= 0){
      carts = [
        {
          product_id: product_id,
          quantity: 1
        }
      ];
    }
    else if (positionThisProductInCart < 0){
      carts.push(
        {
          product_id: product_id,
          quantity: 1
        }
      );
    }
    else {
      carts[positionThisProductInCart].quantity = carts[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    saveDataCart();
  };

  const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = findIndexOfItemInCarts(product_id);
    if(positionItemInCart >= 0){
        const product = findItemInProducts(product_id);
        switch (type) {
            case 'PLUS':
                const isOutOfProduct = Number(carts[positionItemInCart].quantity) === Number(product.quantity);
                if (isOutOfProduct) {
                  const cartItemSoundHTML = document.querySelector(`.cart-item-sound[data-id="${product_id}"]`);
                  const btnPlus = cartItemSoundHTML.querySelector('.quantity .plus');
                  btnPlus.classList.add('disabled');
                  return;
                }
                carts[positionItemInCart].quantity = carts[positionItemInCart].quantity + 1;
                break;
            default:
                let changeQuantity = carts[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                  carts[positionItemInCart].quantity = changeQuantity;
                } else{
                  const itemSound = findItemInProductListHTML(product_id);
                  if (itemSound) {
                    const quantityProductHTML = itemSound.querySelector('.wrapper-content .quantity');
                    quantityProductHTML.innerHTML = `Số lượng: ${product.quantity}`;
                  }
                  else {
                    notificationNotFoundProduct();
                    scollToTop();
                  }
                  carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    saveDataCart();
    addCartToHTML();
  };

  // SHOW LIST PRODUCT CART IN CART TAB
  const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if(carts.length > 0) {
      carts.forEach(item => {
        totalQuantity = totalQuantity +  item.quantity;

        let newItem = document.createElement('div');
        newItem.dataset.id = item.product_id;
        newItem.classList.add('cart-item-sound');

        let product = findItemInProducts(item.product_id);
        let positionProduct = findIndexItemInProducts(item.product_id);
        if (positionProduct !== -1 && product) {
          const productHTML = findItemInProductListHTML(product.id);
          if (productHTML) {
            const quantityProductHTML = productHTML.querySelector('.wrapper-content .quantity');
            const updatedQuantity = Number(product.quantity) - Number(item.quantity);

            const btnAddProductHTML = productHTML.querySelector('.btn-add-to-cart');
            if (updatedQuantity === 0) {
              btnAddProductHTML.disabled = true;
            }
            else {
              btnAddProductHTML.disabled = false;
            }
            quantityProductHTML.innerHTML = `Số lượng: ${updatedQuantity}`;
          }
          
          let info = products[positionProduct];
          listCartHTML.appendChild(newItem);
          newItem.innerHTML = `
            <div class="wrapper-image">
              <img src="${info.image}">
            </div>
            <div class="name">${info.name}</div>
            <div class="quantity">
                <span class="minus">-</span>
                <span>${item.quantity}</span>
                <span class="plus">+</span>
            </div>
          `;
        }
      });
    }
    numberItemCart.innerText = Number(totalQuantity);
  }

  const initApp = async () => {
    await fetch('./products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      addDataToHTML();

      if (localStorage.getItem('carts')) {
        carts = JSON.parse(localStorage.getItem('carts'));
        addCartToHTML();
      }
    })
  };
  initApp();

  // EXPORT CART TAB TO JSON FILE
  const downloadObjectAsJson = (exportObj, exportFileName) => {
    const now = new Date();
    const formattedDate = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
    const fileName = `${exportFileName}_${formattedDate}.json`;

     const jsonString = JSON.stringify(exportObj);
     const blob = new Blob([jsonString], { type: "application/json" });
     const url = URL.createObjectURL(blob);
 
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", fileName);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  }

  // DOWNLOAD FILE
  btnExportFile.addEventListener('click', () => {
    const cartsDownload = typeof carts === 'string' ? JSON.parse(carts) : carts;
    if (cartsDownload.length <= 0) return;
    cartsDownload.forEach(cart => {
      const productId = cart.product_id;
      const product = findItemInProducts(productId);
      if (product) {
        cart.name  = product.name;
        cart.total = product.quantity;
        cart.quantity_out = cart.quantity;
        cart.quantity_remaining = Number(product.quantity) - Number(cart.quantity);
        delete cart.quantity;
      }
    });
    if (cartsDownload.length > 0) {
      downloadObjectAsJson(cartsDownload, 'Cart');
      createToast(
        'success', 
        'fa-solid fa-circle-check', 
        'Download', 
        'Download file thành công'
      );
    }
  });

  // CLICK MINUS/PLUS ITEM CART
  listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    let type = 'MINUS';
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
      const productCart = positionClick.parentElement.parentElement;
      if (productCart) {
        const idProductCart = productCart.dataset.id;
        if (positionClick.classList.contains('plus')) {
          type = 'PLUS';
        }
        changeQuantityCart(idProductCart, type);
      }
    }
  });
})