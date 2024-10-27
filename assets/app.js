document.addEventListener('DOMContentLoaded', function () {
  const listProductHTML = document.querySelector('.list-sounds');
  const listCartHTML = document.querySelector('.list-cart-sounds');
  const blockIconCart = document.querySelector('.block-icon-cart');
  const numberItemCart = document.querySelector(
    '.block-icon-cart .number-sound-cart'
  );
  const blockIconCloseCart = document.querySelector(
    '.cart-tab .block-top-tab .right'
  );
  const body = document.querySelector('body');
  const btnRemoveCart = document.querySelector('.block-bottom-tab .btn-remove');
  const btnExportFile = document.querySelector('.block-bottom-tab .btn-export');
  const blockResultSearchHTML = document.querySelector('.block-result-search');
  const inputSearch = document.querySelector('input[name="name_product"]');
  const iconClearText = document.querySelector('span.icon-search');
  const selectFilter = document.querySelector('select.select-filter');
  let listKeywordsAutocompleteSearch = [];
  let products = [];
  let carts = [];
  let idFilter = '';
  const CATEGORY_DEFINITION = {
    1: 'Hệ thống Âm thanh/Hệ thống loa',
    2: 'Hệ thống Monitor',
    3: 'Hệ thống bàn Mixer Âm thanh',
    4: 'Microphone',
    5: 'Hệ thống Microphone không dây',
    6: 'Phụ kiện',
    7: 'Khác',
  };
  const UNIT_DEFINITION = {
    1: 'Chiếc',
    2: 'Bộ',
    3: 'Khác',
  };
  let previousInputValue = [];

  // SHOW/HIDE CART TAB
  blockIconCart.addEventListener('click', () => {
    body.classList.toggle('showCartTab');
  });

  blockIconCloseCart.addEventListener('click', () => {
    body.classList.toggle('showCartTab');
  });

  btnRemoveCart.addEventListener('click', () => {
    Swal.fire({
      title: 'Xóa giỏ hàng',
      text: 'Bạn có chắc chắn muốn xóa giỏ hàng không ?',
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Có',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Hủy',
      timer: 3000,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `,
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `,
      },
      background: '#e9ecef',
      backdrop: `
        rgba(121, 159, 12, 0.2)
        left top
        no-repeat
      `,
    }).then(async (result) => {
      if (result.isConfirmed) {
        carts = [];
        localStorage.removeItem('carts');
        listCartHTML.innerHTML = '';
        numberItemCart.innerText = 0;
        Swal.fire({
          title: 'Xóa giỏ hàng',
          text: `Xóa câu giỏ hàng thành công`,
          icon: 'success',
          timer: 1500,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  });

  // COMMON FUNCTION
  const findItemInProductListHTML = (id) => {
    if (!id) return;
    return document.querySelector(`.item-sound[data-id='${id}']`);
  };

  const findIndexOfItemInCarts = (product_id) => {
    if (!product_id) return;
    return carts.findIndex((cart) => cart.product_id === product_id);
  };

  const findIndexItemInProducts = (product_id) => {
    if (!product_id) return;
    return products.findIndex((x) => x.id === product_id);
  };

  const findItemInProducts = (product_id) => {
    if (!product_id) return;
    return products.find((x) => x.id === product_id);
  };

  const notificationNotFoundProduct = () => {
    return;
  };

  const scollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveDataCart = () => {
    localStorage.setItem('carts', JSON.stringify(carts));
  };

  // Hàm tìm button theo data-id
  const findButtonById = (id) => {
    const selector = `.btn-add-to-cart[data-id='${id}']`;
    return document.querySelector(selector);
  };

  // Get List Keywords Autocomplete Search
  const getListKeywordsAutocompleteSearch = () => {
    if (!products) return;
    return products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        category: product.category,
      };
    });
  };

  const handleInputChangeQuantity = (event) => {
    const inputElement = event.target;
    if (inputElement) {
      const inputId = inputElement.id.split('-')[1];
      const inputValue = inputElement.value;
      const productQuantityOrigin = findItemInProducts(inputId);

      if (inputValue > productQuantityOrigin.quantity) {
        Swal.fire({
          title: 'Thêm giỏ hàng',
          text: 'Số lượng sản phẩm bạn muốn thêm vượt quá số lượng tồn kho',
          icon: 'warning',
          timer: 3000,
        });
        inputElement.value = Number(productQuantityOrigin.quantity);
        return;
      } else if (inputValue < 0) {
        Swal.fire({
          title: 'Thêm giỏ hàng',
          text: 'Số lượng sản phẩm bạn muốn thêm phải tối thiểu là 1',
          icon: 'warning',
          timer: 3000,
        });
        inputElement.value = 1;
        return;
      } else if (inputValue === '' || inputValue === null) {
        inputElement.value = 0;
        return;
      }
    }
  };

  const updateCart = (event) => {
    const inputElement = event.target;

    if (inputElement) {
      const inputId = inputElement.id.split('-')[1];

      const inputValue = Number(inputElement.value);

      const productQuantityOrigin = findItemInProducts(inputId);

      const previousInputValueIndex = previousInputValue.findIndex(
        (item) => item.id === inputId
      );

      const btnAddToCart = findButtonById(inputId);

      if (inputValue > productQuantityOrigin.quantity) {
        addToCart(inputId, Number(productQuantityOrigin.quantity));
      } else if (inputValue === 0) {
        // Xóa sản phẩm giỏ hàng
        const positionItemInCart = findIndexOfItemInCarts(inputId);
        carts.splice(positionItemInCart, 1);

        // Nút thêm vào giỏ hàng của sản phẩm luôn được mở
        const productHTML = findItemInProductListHTML(inputId);
        const btnAddProductHTML = productHTML.querySelector('.btn-add-to-cart');
        btnAddProductHTML.disabled = false;

        // Cập nhật lại số lượng sản phẩm gốc của giỏ hàng
        const quantityProductHTML = productHTML.querySelector(
          '.wrapper-content .quantity'
        );
        quantityProductHTML.innerHTML = `Số lượng: ${Number(
          productQuantityOrigin.quantity
        )}`;
        // Cập giật giỏ hàng
        saveDataCart();
        addCartToHTML();
      } else if (inputValue < 0) {
        addToCart(inputId, 1);
      } else if (
        inputValue === 1 &&
        previousInputValue[previousInputValueIndex].previousValue === 2
      ) {
        addToCart(inputId, -1);
      } else if (
        inputValue === 1 &&
        previousInputValue[previousInputValueIndex].previousValue >= 0 &&
        btnAddToCart.disabled
      ) {
        addToCart(inputId, -1);
        return;
      } else {
        addToCart(inputId, inputValue);
      }
      previousInputValue[previousInputValueIndex].previousValue = inputValue;
    }
  };

  // SHOW LIST PRODUCT IN HTML
  const addDataToHTML = () => {
    listProductHTML.html = '';
    if (products.length > 0) {
      products.forEach((product) => {
        let newProduct = document.createElement('div');
        newProduct.dataset.id = product.id;
        newProduct.dataset.category = product.category;
        newProduct.classList.add('item-sound');
        newProduct.innerHTML = `
          <div class='wrapper-image'>
            <img src='${product?.image}' alt=''>
          </div>
          <div class='wrapper-content'>
            <h3 class='title'>${product?.name}</h3>
            <p class='quantity'>Số lượng: ${Number(product?.quantity)}</p>
          </div>
          <div class='wrapper-bottom'>
              <input type='number' value='0' id='product-${
                product.id
              }' min='0' max='100' />
              <button class='btn-add-to-cart' data-id='${
                product?.id
              }'>Thêm vào giỏ</button>
          </div>
        `;
        listProductHTML.appendChild(newProduct);
      });

      const btnsAddToCart = document.querySelectorAll('.btn-add-to-cart');
      btnsAddToCart.forEach((btn) => {
        btn.addEventListener('click', function (event) {
          const clickedButton = event.target;
          const dataId = clickedButton.dataset.id;
          if (dataId) {
            const itemSound = findItemInProductListHTML(dataId);
            if (itemSound) {
              addToCart(dataId, 1);
              const inputValueQuantity = document.querySelector(
                `#product-${dataId}`
              );
              if (inputValueQuantity) {
                inputValueQuantity.value = Number(inputValueQuantity.value);
              }
            } else {
              notificationNotFoundProduct();
              scollToTop();
            }
          } else {
            notificationNotFoundProduct();
            scollToTop();
          }
        });
      });

      const inputElements = document.querySelectorAll('input[type="number"]');
      inputElements.forEach((inputElement) => {
        inputElement.addEventListener('input', handleInputChangeQuantity);
      });
      inputElements.forEach((inputElement) => {
        inputElement.addEventListener('change', updateCart);
      });
    }
  };

  // ADD PRODUCT IN CART
  const addToCart = (product_id, quantity = 1) => {
    const positionThisProductInCart = findIndexOfItemInCarts(product_id);

    if (carts.length <= 0) {
      carts = [
        {
          product_id: product_id,
          quantity: Number(quantity),
        },
      ];
    } else if (positionThisProductInCart < 0) {
      carts.push({
        product_id: product_id,
        quantity: Number(quantity),
      });
    } else {
      quantity === 1 || quantity === -1
        ? (carts[positionThisProductInCart].quantity =
            Number(carts[positionThisProductInCart].quantity) + quantity)
        : (carts[positionThisProductInCart].quantity = Number(quantity));
    }
    addCartToHTML();
    saveDataCart();
  };

  const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = findIndexOfItemInCarts(product_id);
    if (positionItemInCart >= 0) {
      const product = findItemInProducts(product_id);
      switch (type) {
        case 'PLUS':
          const isOutOfProduct =
            Number(carts[positionItemInCart].quantity) ===
            Number(product.quantity);
          if (isOutOfProduct) {
            const cartItemSoundHTML = document.querySelector(
              `.cart-item-sound[data-id='${product_id}']`
            );
            const btnPlus = cartItemSoundHTML.querySelector('.quantity .plus');
            btnPlus.classList.add('disabled');
            return;
          }
          carts[positionItemInCart].quantity =
            carts[positionItemInCart].quantity + 1;
          document.querySelector(`#product-${product_id}`).value = Number(
            carts[positionItemInCart].quantity
          );
          break;
        default:
          let changeQuantity = carts[positionItemInCart].quantity - 1;
          if (changeQuantity > 0) {
            carts[positionItemInCart].quantity = changeQuantity;
            document.querySelector(`#product-${product_id}`).value =
              carts[positionItemInCart].quantity;
          } else {
            const itemSound = findItemInProductListHTML(product_id);
            if (itemSound) {
              const quantityProductHTML = itemSound.querySelector(
                '.wrapper-content .quantity'
              );
              quantityProductHTML.innerHTML = `Số lượng: ${product.quantity}`;
              document.querySelector(`#product-${product_id}`).value = 0;
              const btnAddToCart = itemSound.querySelector(
                '.wrapper-bottom .btn-add-to-cart'
              );
              if (btnAddToCart) {
                btnAddToCart.disabled = false;
              }
            } else {
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
    if (carts.length > 0) {
      carts.forEach((item) => {
        totalQuantity = totalQuantity + item.quantity;

        let newItem = document.createElement('div');
        newItem.dataset.id = item.product_id;
        newItem.classList.add('cart-item-sound');

        let product = findItemInProducts(item.product_id);
        let positionProduct = findIndexItemInProducts(item.product_id);
        if (positionProduct !== -1 && product) {
          const productHTML = findItemInProductListHTML(product.id);
          if (productHTML) {
            const quantityProductHTML = productHTML.querySelector(
              '.wrapper-content .quantity'
            );
            const updatedQuantity =
              Number(product.quantity) - Number(item.quantity);

            const btnAddProductHTML =
              productHTML.querySelector('.btn-add-to-cart');
            if (updatedQuantity === 0) {
              btnAddProductHTML.disabled = true;
            } else {
              btnAddProductHTML.disabled = false;
            }
            quantityProductHTML.innerHTML = `Số lượng: ${updatedQuantity}`;
          }

          let info = products[positionProduct];
          listCartHTML.appendChild(newItem);
          newItem.innerHTML = `
            <div class='wrapper-image'>
              <img src='${info.image}'>
            </div>
            <div class='name'>${info.name}</div>
            <div class='quantity'>
                <span class='minus'>-</span>
                <span>${item.quantity}</span>
                <span class='plus'>+</span>
            </div>
          `;
        }
        // BUGS
        document.querySelector(`#product-${item.product_id}`).value = Number(
          item.quantity
        );
      });
    }
    numberItemCart.innerText = Number(totalQuantity);
  };

  const initApp = async () => {
    const response = await fetchAPI(`${BASE_URL_API}/products`);
    if (response.status === 200 && response.ok) {
      const data = await response.json();
      products = data?.data.map((product) => {
        const { _id, ...rest } = product;
        return {
          id: _id,
          ...rest,
        };
      });
      previousInputValue = products.map((product) => ({
        id: product.id,
        previousValue: 0,
      }));

      if (products && products.length > 0) {
        listKeywordsAutocompleteSearch = getListKeywordsAutocompleteSearch();
      }
      addDataToHTML();

      // Add element option to tag select
      if (selectFilter) {
        for (const key in CATEGORY_DEFINITION) {
          if (CATEGORY_DEFINITION.hasOwnProperty(key)) {
            const optionElement = document.createElement('option');
            optionElement.value = key;
            optionElement.textContent = CATEGORY_DEFINITION[key];
            selectFilter.appendChild(optionElement);
          }
        }
      }

      if (localStorage.getItem('carts')) {
        carts = JSON.parse(localStorage.getItem('carts'));
        addCartToHTML();
      }
    }
  };
  initApp();

  const setNoBorderForRowInExcel = (worksheet, rowNumber) => {
    if (!worksheet || !rowNumber) return;
    worksheet.getRow(rowNumber).eachCell((cell) => {
      cell.border = {
        top: { style: 'none' },
        left: { style: 'none' },
        bottom: { style: 'none' },
        right: { style: 'none' },
      };
    });
  };

  const handleAddRowWithTextInExcel = (
    worksheet,
    text = '',
    rowNumber = 1, // Dữ liệu được thêm vào sẽ được thêm vào dòng thứ bao nhiêu trong worksheet của file excel
    mergeCells = 'A1:E1',
    mergedCellValue = 'A1',
    fontSize = 10,
    vertial = 'middle',
    horizontal = 'left',
    heightCell = 80,
    colorText
  ) => {
    if (!worksheet) return;
    // Thêm 1 dòng với đoạn text cố định vào worksheet
    // worksheet.insertRow(1, [text]);

    // Đặt nội dung cho dòng chỉ định thay vì chèn dòng mới
    worksheet.getRow(rowNumber).values = [text];

    // Merge các ô từ cột A đến cột E tại dòng chỉ định
    worksheet.mergeCells(mergeCells);

    // Định dạng văn bản trong ô hợp nhất từ cột A đến cột E tại dòng chỉ định
    const mergedCell = worksheet.getCell(mergedCellValue);
    mergedCell.font = {
      name: 'Arial',
      bold: true,
      size: Number(fontSize),
      color: colorText ? { argb: colorText } : undefined,
    };
    mergedCell.alignment = {
      vertical: vertial,
      horizontal: horizontal,
      wrapText: true,
    };

    worksheet.getRow(rowNumber).height = Number(heightCell);
  };

  // EXPORT CART TAB TO JSON FILE
  const downloadObjectAsJson = async (exportObj, exportFileName) => {
    // Tạo tên file
    const now = new Date();
    const formattedDate = `${now.getDate()}_${
      now.getMonth() + 1
    }_${now.getFullYear()}`;
    const fileName = `${exportFileName}_${formattedDate}.xlsx`;

    // Sử dụng ExcelJS từ đối tượng toàn cục
    const ExcelJS = window.ExcelJS;

    // Tạo một workbook mới
    const workbook = new ExcelJS.Workbook();
    // Tạo ra một worksheet mới và đặt tên cho worksheet đó có name là formattedDate và thêm vào workbook
    const worksheet = workbook.addWorksheet(formattedDate);

    // Thiết lập cột dựa trên keys của đối tượng đầu tiên trong exportObj
    const columns = Object.keys(exportObj[0]).map((key) => ({
      header: key,
      key: key,
      width: 30,
    }));
    // Thiết lập các cột cho worksheet
    worksheet.columns = columns;

    // Dòng 1
    handleAddRowWithTextInExcel(
      worksheet,
      `CÔNG TY CỔ PHẦN DỊCH VỤ GIẢI PHÁP BIỂU DIỄN\nSố 22 Phố Hồ Giám, Phường Quốc Tử Giám, Quận Đống Đa, Thành Phố Hà Nội\nĐiện thoại : 024 3217 1800\nMã số thuế : 0107966043`,
      1,
      'A1:E1',
      'A1',
      10,
      'middle',
      'left',
      80
    );

    // Dòng 2
    handleAddRowWithTextInExcel(
      worksheet,
      `DANH SÁCH THIẾT BỊ`,
      2,
      'A2:E2',
      'A2',
      12,
      'middle',
      'center',
      40,
      'FF0000FF'
    );

    // Dòng 3
    handleAddRowWithTextInExcel(
      worksheet,
      `Show:\nĐịa điểm:\nThời gian:`,
      3,
      'A3:E3',
      'A3',
      10,
      'middle',
      'left',
      40
    );

    // Xóa border cho các dòng chỉ định
    setNoBorderForRowInExcel(worksheet, 1);
    setNoBorderForRowInExcel(worksheet, 2);
    setNoBorderForRowInExcel(worksheet, 3);

    // Thêm các hàng từ đối tượng JSON
    worksheet.addRows(exportObj);

    // Thêm hàng tiêu đề (Dòng 4) với các tiêu đề cột (Tương ứng với các key của object)
    worksheet.insertRow(4, Object.keys(exportObj[0]));

    // Định dạng hàng tiêu đề (Bắt đầu từ dòng 4)
    worksheet.getRow(4).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' },
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    // Định dạng các hàng còn lại ((bắt đầu từ dòng 5))
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' },
          };
          cell.font = {
            color: { argb: 'FF000000' },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
          };

          // Kiểm tra nếu nội dung là số thì canh giữa, ngược lại canh trái
          if (typeof cell.value === 'number') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });
      }
    });

    // Lấy ra dòng cuối cùng của sheet hiện tại của workbook của file excel
    const lastRow = worksheet.lastRow.number;

    // Thêm các dòng vào dưới bảng các dụng cụ
    handleAddRowWithTextInExcel(
      worksheet,
      `TỔNG GÓI ÂM THANH, ÁNH SÁNG:`,
      lastRow + 1,
      `A${lastRow + 1}:E${lastRow + 1}`,
      `A${lastRow + 1}`,
      10,
      'middle',
      'left',
      20
    );

    // Đẩy nội dung của ô lastRow + 1 cách lề trái
    worksheet.getCell(`A${lastRow + 1}`).alignment = {
      vertical: 'middle',
      horizontal: 'left',
      indent: 30, // Tăng giá trị này để thụt vào nhiều hơn
    };

    handleAddRowWithTextInExcel(
      worksheet,
      '',
      lastRow + 2,
      `A${lastRow + 2}:E${lastRow + 2}`,
      `A${lastRow + 2}`,
      10,
      'middle',
      'left',
      20
    );

    handleAddRowWithTextInExcel(
      worksheet,
      '',
      lastRow + 3,
      `A${lastRow + 3}:E${lastRow + 3}`,
      `A${lastRow + 3}`,
      10,
      'middle',
      'left',
      20
    );

    // Ghi workbook vào một buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Tạo một Blob từ buffer
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Tạo một phần tử liên kết để tải xuống tệp
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Thêm liên kết vào body và click để bắt đầu tải xuống
    document.body.appendChild(link);
    link.click();

    // Xóa liên kết sau khi tải xuống bắt đầu
    document.body.removeChild(link);
  };

  // DOWNLOAD FILE
  btnExportFile.addEventListener('click', () => {
    const cartsDownload = typeof carts === 'string' ? JSON.parse(carts) : carts;
    const cloneCartDownload = _.cloneDeep(cartsDownload);
    let index = 1;
    if (cloneCartDownload.length <= 0) return;
    cloneCartDownload.forEach((cart) => {
      const productId = cart.product_id;
      const product = findItemInProducts(productId);
      if (product) {
        cart['STT'] = index++;
        cart['Danh mục'] = CATEGORY_DEFINITION[product.category];
        cart['Thiết bị'] = product.name;
        cart['Đơn vị'] = UNIT_DEFINITION[product.unit];
        cart['Số lượng'] = cart.quantity;
        cart['Ghi chú'] = '';
        delete cart.quantity;
        delete cart.product_id;
      }
    });

    if (cloneCartDownload.length > 0) {
      downloadObjectAsJson(cloneCartDownload, 'Cart');
    }
    index = 1;
  });

  // CLICK MINUS/PLUS ITEM CART
  listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    let type = 'MINUS';
    if (
      positionClick.classList.contains('minus') ||
      positionClick.classList.contains('plus')
    ) {
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

  // AutoComplete Search
  const toggleAllItemSoundSearch = (isShow = false) => {
    const listSounds = document.querySelectorAll('.list-sounds .item-sound');
    if (isShow) {
      listSounds.forEach((item) => {
        item.classList.remove('hidden');
      });
    } else {
      listSounds.forEach((item) => {
        item.classList.add('hidden');
      });
    }
    blockResultSearchHTML.innerHTML = '';
  };

  inputSearch.onkeyup = function (event) {
    let resultListSearch = [];
    let value = inputSearch.value;

    if (value.length > 0) {
      iconClearText.classList.add('show-icon');
      if (idFilter === '' || idFilter === null || idFilter === undefined) {
        resultListSearch = listKeywordsAutocompleteSearch.filter((keyword) => {
          return keyword?.name
            .toLowerCase()
            .trim()
            .includes(value.toLowerCase().trim());
        });
      } else {
        let newListKeywordsAutocompleteSearch =
          listKeywordsAutocompleteSearch.filter(
            (x) => Number(x.category) === Number(idFilter)
          );
        resultListSearch = newListKeywordsAutocompleteSearch.filter(
          (keyword) => {
            return keyword?.name
              .toLowerCase()
              .trim()
              .includes(value.toLowerCase().trim());
          }
        );
      }
    }

    if (resultListSearch.length > 0) {
      displayListResultHTML(resultListSearch);
    } else {
      toggleAllItemSoundSearch(false);
    }

    if (value.length === 0) {
      toggleAllItemSoundSearch(true);
      iconClearText.classList.remove('show-icon');
    }
  };

  const selectInputSearch = (html) => {
    // html chính là thẻ li mà chúng ta click chọn
    if (!html) return;
    const id = html.dataset.id;
    if (id) {
      inputSearch.value = html.innerHTML;
      blockResultSearchHTML.innerHTML = '';
      const listSounds = document.querySelectorAll('.list-sounds .item-sound');
      listSounds.forEach((item) => {
        if (item.dataset.id === id) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    }
  };

  const displayListResultHTML = (listResult) => {
    if (!listResult) return;
    blockResultSearchHTML.innerHTML = '';
    const content = listResult.map(
      (item) => `<li data-id=${item?.id}>${item?.name}</li>`
    );
    blockResultSearchHTML.innerHTML = `<ul class='list-result-search'>${content.join(
      ''
    )}</ul>`;
    const listLi = document.querySelectorAll('.list-result-search li');
    listLi.forEach((itemLi) => {
      itemLi.addEventListener('click', function (event) {
        selectInputSearch(this);
      });
    });
  };

  iconClearText.onclick = function (event) {
    inputSearch.value = '';
    toggleAllItemSoundSearch(true);
    blockResultSearchHTML.innerHTML = '';
  };

  selectFilter.onchange = function (event) {
    const value = selectFilter.value;
    idFilter = value;
    const listSounds = document.querySelectorAll('.list-sounds .item-sound');
    if (value && value !== '' && value !== null && value !== undefined) {
      if (products.length > 0) {
        listSounds.forEach((item) => {
          if (Number(item.dataset.category) === Number(value)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      }
    } else {
      listSounds.forEach((item) => {
        item.style.display = 'flex';
      });
    }
  };
});
