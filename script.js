document.addEventListener('DOMContentLoaded', function() {
    var cart = JSON.parse(localStorage.getItem('brisitasCart')) || [];

    initMobileMenu();
    initSlider();
    initCart();
    initCatalogFilters();
    initStoredProducts();
    initCheckout();
    initContactForm();
    initNewsletterForms();
    initAdminPanel();

    function initMobileMenu() {
        var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        var navList = document.querySelector('.nav-list');

        if (!mobileMenuBtn || !navList) return;

        mobileMenuBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
        });

        var navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function(item) {
            var dropdown = item.querySelector('.dropdown');
            if (!dropdown) return;

            item.addEventListener('click', function(e) {
                if (window.innerWidth > 768) return;

                var link = e.target.closest('.nav-link');
                if (!link || link.parentElement !== item) return;

                e.preventDefault();
                navItems.forEach(function(otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        });
    }

    function initCart() {
        var cartIcon = document.querySelector('.cart-icon');
        var cartCount = document.querySelector('.cart-count');

        updateCartCount();

        document.addEventListener('click', function(e) {
            var button = e.target.closest('.add-to-cart');
            if (!button) return;
            if (button.classList.contains('disabled')) return;
            e.preventDefault();

            var productCard = button.closest('.product-card');
            if (!productCard) return;

            var product = getProductData(productCard);
            addToCart(product, 1);
            showNotification(product.title + ' anadido al carrito');
        });

        if (cartIcon) {
            cartIcon.addEventListener('click', function() {
                toggleCartModal();
            });
        }

        function addToCart(product, quantity) {
            var existingIndex = cart.findIndex(function(item) {
                return item.id === product.id;
            });

            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    imgSrc: product.imgSrc,
                    quantity: quantity,
                    category: product.category,
                    tags: product.tags
                });
            }

            saveCart();
            updateCartCount();
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            updateCartModal();
        }

        function updateQuantity(index, newQuantity) {
            if (newQuantity < 1) {
                removeFromCart(index);
                return;
            }

            cart[index].quantity = newQuantity;
            saveCart();
            updateCartCount();
            updateCartModal();
        }

        function saveCart() {
            localStorage.setItem('brisitasCart', JSON.stringify(cart));
        }

        function updateCartCount() {
            var totalItems = cart.reduce(function(total, item) {
                return total + item.quantity;
            }, 0);

            if (!cartCount) return;

            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems === 0 ? 'none' : 'flex';
        }

        function calculateTotal() {
            var total = cart.reduce(function(total, item) {
                return total + (item.price * item.quantity);
            }, 0);
            return total;
        }

        function createCartModal() {
            if (document.getElementById('cart-modal')) return;

            var modal = document.createElement('div');
            modal.id = 'cart-modal';
            modal.className = 'cart-modal';
            modal.innerHTML =
                '<div class="cart-modal-content">' +
                    '<div class="cart-modal-header">' +
                        '<h3>Tu Carrito</h3>' +
                        '<button class="close-cart" aria-label="Cerrar">&times;</button>' +
                    '</div>' +
                    '<div class="cart-items"></div>' +
                    '<div class="cart-footer">' +
                        '<div class="cart-total">' +
                            '<span>Total:</span>' +
                            '<span class="total-amount">0,00€</span>' +
                        '</div>' +
                        '<div class="cart-buttons">' +
                            '<button class="clear-cart">Vaciar carrito</button>' +
                            '<button class="checkout-btn">Finalizar compra</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            document.body.appendChild(modal);

            modal.querySelector('.close-cart').addEventListener('click', toggleCartModal);
            modal.querySelector('.clear-cart').addEventListener('click', clearCart);
            modal.querySelector('.checkout-btn').addEventListener('click', checkout);

            document.addEventListener('click', function(e) {
                if (!modal.classList.contains('active')) return;
                if (!modal.contains(e.target) && (!cartIcon || !cartIcon.contains(e.target))) {
                    toggleCartModal();
                }
            });
        }

        function toggleCartModal() {
            createCartModal();
            var modal = document.getElementById('cart-modal');
            modal.classList.toggle('active');
            if (modal.classList.contains('active')) {
                updateCartModal();
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        function updateCartModal() {
            var cartItemsContainer = document.querySelector('.cart-items');
            var totalElement = document.querySelector('.total-amount');
            if (!cartItemsContainer || !totalElement) return;

            cartItemsContainer.innerHTML = '';

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="cart-empty-message">Tu carrito esta vacio</div>';
                totalElement.textContent = '0,00€';
                return;
            }

            cart.forEach(function(item, index) {
                var cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML =
                    '<img src="' + item.imgSrc + '" alt="' + item.title + '" class="cart-item-img">' +
                    '<div class="cart-item-info">' +
                        '<div class="cart-item-title">' + item.title + '</div>' +
                        '<div class="cart-item-price">' + formatPrice(item.price) + '€</div>' +
                        '<div class="cart-item-controls">' +
                            '<button class="quantity-btn decrease" data-index="' + index + '">-</button>' +
                            '<span class="cart-item-quantity">' + item.quantity + '</span>' +
                            '<button class="quantity-btn increase" data-index="' + index + '">+</button>' +
                            '<button class="remove-item" data-index="' + index + '" aria-label="Eliminar">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>';

                cartItemsContainer.appendChild(cartItem);
            });

            totalElement.textContent = formatPrice(calculateTotal()) + '€';

            document.querySelectorAll('.quantity-btn.decrease').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var index = parseInt(this.dataset.index, 10);
                    updateQuantity(index, cart[index].quantity - 1);
                });
            });

            document.querySelectorAll('.quantity-btn.increase').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var index = parseInt(this.dataset.index, 10);
                    updateQuantity(index, cart[index].quantity + 1);
                });
            });

            document.querySelectorAll('.remove-item').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var index = parseInt(this.dataset.index, 10);
                    removeFromCart(index);
                });
            });
        }

        function clearCart() {
            cart = [];
            saveCart();
            updateCartCount();
            updateCartModal();
        }

        function checkout() {
            window.location.href = 'checkout.html';
        }
    }

    function initCatalogFilters() {
        var productCards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
        if (!productCards.length) return;

        var searchInputs = document.querySelectorAll('.search-input');
        var filterForm = document.querySelector('.catalog-filters');
        var pageCategory = document.body.getAttribute('data-page-category');
        if (!filterForm && !pageCategory) return;
        if (!filterForm) {
            filterForm = createFilterControls();
        }

        var categorySelect = filterForm ? filterForm.querySelector('[data-filter="category"]') : null;
        var priceSelect = filterForm ? filterForm.querySelector('[data-filter="price"]') : null;
        var sortSelect = filterForm ? filterForm.querySelector('[data-filter="sort"]') : null;
        var resetBtn = filterForm ? filterForm.querySelector('[data-filter="reset"]') : null;
        var noResults = document.querySelector('[data-no-results]');

        var originalOrder = productCards.map(function(card, index) {
            card.dataset.originalIndex = index;
            return card;
        });

        var filterState = {
            search: '',
            category: 'all',
            price: 'all',
            sort: 'featured'
        };

        if (searchInputs.length) {
            searchInputs.forEach(function(input) {
                input.addEventListener('input', function() {
                    filterState.search = this.value.trim().toLowerCase();
                    applyFilters();
                });
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                filterState.category = this.value;
                applyFilters();
            });
        }

        if (priceSelect) {
            priceSelect.addEventListener('change', function() {
                filterState.price = this.value;
                applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                filterState.sort = this.value;
                applyFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                filterState = {
                    search: '',
                    category: 'all',
                    price: 'all',
                    sort: 'featured'
                };
                if (categorySelect) categorySelect.value = 'all';
                if (priceSelect) priceSelect.value = 'all';
                if (sortSelect) sortSelect.value = 'featured';
                searchInputs.forEach(function(input) {
                    input.value = '';
                });
                applyFilters();
            });
        }

        applyFilters();

        function createFilterControls() {
            var target = document.querySelector('.featured-products') || document.querySelector('.products-grid');
            if (!target) return null;

            var wrapper = document.createElement('section');
            wrapper.className = 'catalog-filters';
            wrapper.innerHTML =
                '<div class="container">' +
                    '<form>' +
                        '<div class="filter-group">' +
                            '<label for="filter-category">Categoria</label>' +
                            '<select id="filter-category" class="filter-select" data-filter="category">' +
                                '<option value="all">Todas</option>' +
                                '<option value="ropa">Ropa</option>' +
                                '<option value="recien">Recien Nacidos</option>' +
                                '<option value="bebes">Bebes</option>' +
                                '<option value="alimentacion">Alimentacion</option>' +
                                '<option value="biberones">Biberones</option>' +
                                '<option value="lactancia">Lactancia</option>' +
                                '<option value="descanso">Descanso</option>' +
                                '<option value="cunas">Cunas</option>' +
                                '<option value="sabanas">Sabanas</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="filter-group">' +
                            '<label for="filter-price">Precio</label>' +
                            '<select id="filter-price" class="filter-select" data-filter="price">' +
                                '<option value="all">Todos</option>' +
                                '<option value="0-10">0 - 10</option>' +
                                '<option value="10-25">10 - 25</option>' +
                                '<option value="25-50">25 - 50</option>' +
                                '<option value="50-100">50 - 100</option>' +
                                '<option value="100+">100+</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="filter-group">' +
                            '<label for="filter-sort">Ordenar</label>' +
                            '<select id="filter-sort" class="filter-select" data-filter="sort">' +
                                '<option value="featured">Destacados</option>' +
                                '<option value="price-asc">Precio: menor a mayor</option>' +
                                '<option value="price-desc">Precio: mayor a menor</option>' +
                                '<option value="name-asc">Nombre: A-Z</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="filter-actions">' +
                            '<button class="filter-btn secondary" type="button" data-filter="reset">Limpiar filtros</button>' +
                        '</div>' +
                    '</form>' +
                '</div>';

            target.parentNode.insertBefore(wrapper, target);

            if (!document.querySelector('[data-no-results]')) {
                var empty = document.createElement('div');
                empty.className = 'container';
                empty.innerHTML = '<div class="no-results" data-no-results style="display: none;">No se encontraron productos con esos filtros.</div>';
                wrapper.parentNode.insertBefore(empty, target);
            }

            return wrapper;
        }


    function initStoredProducts() {
        var grid = document.querySelector('.products-grid');
        var pageCategory = document.body.getAttribute('data-page-category');
        if (!grid || !pageCategory) return;

        var products = getStoredProducts().filter(function(product) {
            return product.category === pageCategory;
        });

        if (!products.length) return;

        products.forEach(function(product) {
            grid.appendChild(createProductCard(product));
        });
    }
        function applyFilters() {
            var visibleCount = 0;
            productCards.forEach(function(card) {
                var product = getProductData(card);
                var matchesSearch = !filterState.search || product.searchText.indexOf(filterState.search) !== -1;
                var matchesCategory = filterState.category === 'all' || product.category === filterState.category;
                var matchesPrice = matchesPriceRange(product.price, filterState.price);

                var show = matchesSearch && matchesCategory && matchesPrice;
                card.style.display = show ? '' : 'none';
                if (show) visibleCount += 1;
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            if (filterState.sort !== 'featured') {
                sortProducts(filterState.sort);
            } else {
                restoreOriginalOrder();
            }
        }

        function sortProducts(sortValue) {
            var grids = document.querySelectorAll('.products-grid');
            grids.forEach(function(grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
                cards.sort(function(a, b) {
                    var productA = getProductData(a);
                    var productB = getProductData(b);

                    if (sortValue === 'price-asc') {
                        return productA.price - productB.price;
                    }

                    if (sortValue === 'price-desc') {
                        return productB.price - productA.price;
                    }

                    if (sortValue === 'name-asc') {
                        return productA.title.localeCompare(productB.title);
                    }

                    return 0;
                });

                cards.forEach(function(card) {
                    grid.appendChild(card);
                });
            });
        }

        function restoreOriginalOrder() {
            var grids = document.querySelectorAll('.products-grid');
            grids.forEach(function(grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
                cards.sort(function(a, b) {
                    return parseInt(a.dataset.originalIndex, 10) - parseInt(b.dataset.originalIndex, 10);
                });
                cards.forEach(function(card) {
                    grid.appendChild(card);
                });
            });
        }
    }

    function initCheckout() {
        var checkoutForm = document.querySelector('[data-checkout-form]');
        var itemsContainer = document.querySelector('[data-checkout-items]');
        var subtotalEl = document.querySelector('[data-checkout-subtotal]');
        var shippingEl = document.querySelector('[data-checkout-shipping]');
        var totalEl = document.querySelector('[data-checkout-total]');
        var shippingSelect = document.querySelector('[data-shipping-select]');
        var statusBanner = document.querySelector('[data-checkout-status]');

        if (!checkoutForm || !itemsContainer || !subtotalEl || !shippingEl || !totalEl) return;

        renderCheckoutSummary();

        if (shippingSelect) {
            shippingSelect.addEventListener('change', renderCheckoutSummary);
        }

        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!cart.length) {
                showNotification('Tu carrito esta vacio');
                return;
            }

            var order = buildOrderFromForm(checkoutForm);
            saveOrder(order);
            cart = [];
            localStorage.setItem('brisitasCart', JSON.stringify(cart));
            renderCheckoutSummary();

            if (statusBanner) {
                statusBanner.classList.add('active');
                    statusBanner.innerHTML = 'Pedido confirmado. Numero de pedido: <strong>' + order.id + '</strong>';
            }

            checkoutForm.reset();
        });

        function renderCheckoutSummary() {
            itemsContainer.innerHTML = '';

            if (!cart.length) {
                itemsContainer.innerHTML = '<p>Tu carrito esta vacio.</p>';
            } else {
                cart.forEach(function(item) {
                    var row = document.createElement('div');
                    row.className = 'summary-item';
                    row.innerHTML =
                        '<img src="' + item.imgSrc + '" alt="' + item.title + '">' +
                        '<div>' +
                            '<strong>' + item.title + '</strong><br>' +
                            '<span>' + item.quantity + ' x ' + formatPrice(item.price) + '€</span>' +
                        '</div>';
                    itemsContainer.appendChild(row);
                });
            }

            var subtotal = cart.reduce(function(total, item) {
                return total + (item.price * item.quantity);
            }, 0);

            var shippingCost = getShippingCost();
            subtotalEl.textContent = formatPrice(subtotal) + '€';
            shippingEl.textContent = formatPrice(shippingCost) + '€';
            totalEl.textContent = formatPrice(subtotal + shippingCost) + '€';
        }

        function getShippingCost() {
            if (!shippingSelect) return 0;
            var selected = shippingSelect.options[shippingSelect.selectedIndex];
            return parseFloat(selected.getAttribute('data-shipping') || '0');
        }

        function buildOrderFromForm(form) {
            var formData = new FormData(form);
            var customer = {
                nombre: formData.get('nombre') || '',
                email: formData.get('email') || '',
                telefono: formData.get('telefono') || '',
                direccion: formData.get('direccion') || '',
                ciudad: formData.get('ciudad') || '',
                isla: formData.get('isla') || '',
                notas: formData.get('notas') || ''
            };

            return {
                id: generateOrderId(),
                createdAt: new Date().toISOString(),
                items: cart,
                customer: customer,
                shipping: getShippingCost(),
                total: cart.reduce(function(total, item) {
                    return total + (item.price * item.quantity);
                }, 0) + getShippingCost(),
                status: 'Procesando'
            };
        }
    }

    function initContactForm() {
        var contactForm = document.querySelector('[data-contact-form]');
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var formData = new FormData(contactForm);
            var message = {
                nombre: formData.get('nombre') || '',
                email: formData.get('email') || '',
                asunto: formData.get('asunto') || '',
                mensaje: formData.get('mensaje') || '',
                createdAt: new Date().toISOString()
            };

            var messages = JSON.parse(localStorage.getItem('brisitasMessages')) || [];
            messages.push(message);
            localStorage.setItem('brisitasMessages', JSON.stringify(messages));
            contactForm.reset();
            showNotification('Gracias por escribirnos. Te responderemos pronto.');
        });
    }

    function initNewsletterForms() {
        var forms = document.querySelectorAll('.newsletter-form, .widget-newsletter');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Suscripcion registrada. Gracias.');
                form.reset();
            });
        });
    }

    function initAdminPanel() {
        var ordersContainer = document.querySelector('[data-admin-orders]');
        var productForm = document.querySelector('[data-admin-product-form]');
        var productsContainer = document.querySelector('[data-admin-products]');

        if (ordersContainer) {
            renderOrders(ordersContainer);
        }

        if (productForm && productsContainer) {
            initAdminProducts(productForm, productsContainer);
        }
    }

    function renderOrders(ordersContainer) {
        var orders = JSON.parse(localStorage.getItem('brisitasOrders')) || [];

        if (!orders.length) {
            ordersContainer.innerHTML = '<p>No hay pedidos registrados todavia.</p>';
            return;
        }

        var rows = orders.map(function(order) {
            var date = new Date(order.createdAt).toLocaleDateString('es-ES');
            var total = formatPrice(order.total) + '€';
            return '<tr>' +
                '<td>' + order.id + '</td>' +
                '<td>' + date + '</td>' +
                '<td>' + (order.customer && order.customer.nombre ? order.customer.nombre : '-') + '</td>' +
                '<td>' + total + '</td>' +
                '<td><span class="pill">' + order.status + '</span></td>' +
            '</tr>';
        }).join('');

        ordersContainer.innerHTML =
            '<table class="admin-table">' +
                '<thead>' +
                    '<tr>' +
                        '<th>Pedido</th>' +
                        '<th>Fecha</th>' +
                        '<th>Cliente</th>' +
                        '<th>Total</th>' +
                        '<th>Estado</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>';
    }

    function initAdminProducts(productForm, productsContainer) {
        renderAdminProducts(productsContainer, getStoredProducts());

        productForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var formData = new FormData(productForm);
            var name = (formData.get('nombre') || '').trim();
            var price = normalizePrice(formData.get('precio'));
            var stock = normalizeStock(formData.get('stock'));
            var category = formData.get('categoria') || 'general';
            var imageUrl = (formData.get('imagenUrl') || '').trim();
            var imageFile = productForm.querySelector('[name="imagenFile"]').files[0];

            if (!name || price <= 0) {
                showNotification('Completa el nombre y un precio valido.');
                return;
            }

            if (imageFile) {
                readFileAsDataUrl(imageFile, function(result) {
                    saveAdminProduct({
                        id: createProductId(name),
                        name: name,
                        price: price,
                        stock: stock,
                        category: category,
                        image: result
                    }, productsContainer, productForm);
                });
                return;
            }

            saveAdminProduct({
                id: createProductId(name),
                name: name,
                price: price,
                stock: stock,
                category: category,
                image: imageUrl || './Img/Logo.png'
            }, productsContainer, productForm);
        });

        productsContainer.addEventListener('click', function(e) {
            var removeBtn = e.target.closest('[data-remove-product]');
            if (!removeBtn) return;
            var productId = removeBtn.getAttribute('data-remove-product');
            var products = getStoredProducts().filter(function(product) {
                return product.id !== productId;
            });
            saveStoredProducts(products);
            renderAdminProducts(productsContainer, products);
        });
    }

    function saveAdminProduct(product, productsContainer, productForm) {
        var products = getStoredProducts();
        products.unshift(product);
        saveStoredProducts(products);
        renderAdminProducts(productsContainer, products);
        productForm.reset();
        showNotification('Producto guardado en el panel.');
    }

    function renderAdminProducts(container, products) {
        if (!products.length) {
            container.innerHTML = '<p>No hay productos cargados aun.</p>';
            return;
        }

        var cards = products.map(function(product) {
            var image = product.image || './Img/Logo.png';
            return '<div class="admin-product-card">' +
                '<div class="admin-product-media">' +
                    '<img src="' + image + '" alt="' + product.name + '">' +
                '</div>' +
                '<div class="admin-product-info">' +
                    '<h3>' + product.name + '</h3>' +
                    '<p><strong>Categoria:</strong> ' + product.category + '</p>' +
                    '<p><strong>Precio:</strong> ' + formatPrice(product.price) + '€</p>' +
                    '<p><strong>Stock:</strong> ' + product.stock + '</p>' +
                '</div>' +
                '<div class="admin-product-actions">' +
                    '<button class="secondary-btn" type="button" data-remove-product="' + product.id + '">Eliminar</button>' +
                '</div>' +
            '</div>';
        }).join('');

        container.innerHTML = '<div class="admin-products-grid">' + cards + '</div>';
    }

    function getProductData(card) {
        var titleEl = card.querySelector('.product-title');
        var priceEl = card.querySelector('.product-price');
        var imgEl = card.querySelector('.product-img img');

        var title = card.dataset.productName || (titleEl ? titleEl.textContent.trim() : 'Producto');
        var priceValue = card.dataset.productPrice || (priceEl ? priceEl.textContent.replace('EUR', '').replace('€', '').trim() : '0');
        var price = parseFloat(priceValue.replace(',', '.')) || 0;
        var imgSrc = card.dataset.productImage || (imgEl ? imgEl.src : '');
        var category = card.dataset.productCategory || document.body.getAttribute('data-page-category') || 'general';
        var tags = card.dataset.productTags || '';
        var id = card.dataset.productId || slugify(title);

        var searchText = (title + ' ' + category + ' ' + tags).toLowerCase();

        return {
            id: id,
            title: title,
            price: price,
            imgSrc: imgSrc,
            category: category,
            tags: tags,
            searchText: searchText
        };
    }

    function createProductCard(product) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        card.dataset.productName = product.name;
        card.dataset.productPrice = product.price;
        card.dataset.productImage = product.image || './Img/Logo.png';
        card.dataset.productCategory = product.category;
        card.dataset.productStock = product.stock;

        var isOut = product.stock <= 0;
        var buttonClass = isOut ? 'add-to-cart disabled' : 'add-to-cart';
        var buttonText = isOut ? 'Sin stock' : 'Anadir al carrito';
        var image = product.image || './Img/Logo.png';

        card.innerHTML =
            '<div class="product-img">' +
                '<img src="' + image + '" alt="' + product.name + '" style="width: 100%; height: auto;" />' +
            '</div>' +
            '<div class="product-content">' +
                '<h3 class="product-title">' + product.name + '</h3>' +
                '<p class="product-price">' + formatPrice(product.price) + '€</p>' +
                '<a href="#" class="' + buttonClass + '">' + buttonText + '</a>' +
            '</div>';

        return card;
    }

    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function matchesPriceRange(price, range) {
        if (range === 'all') return true;
        if (range === '0-10') return price >= 0 && price <= 10;
        if (range === '10-25') return price > 10 && price <= 25;
        if (range === '25-50') return price > 25 && price <= 50;
        if (range === '50-100') return price > 50 && price <= 100;
        if (range === '100+') return price > 100;
        return true;
    }

    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',');
    }

    function normalizePrice(value) {
        return parseFloat(String(value || '').replace(',', '.')) || 0;
    }

    function normalizeStock(value) {
        var stock = parseInt(value, 10);
        if (isNaN(stock) || stock < 0) return 0;
        return stock;
    }

    function createProductId(name) {
        return slugify(name) + '-' + Date.now().toString(36);
    }

    function readFileAsDataUrl(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function getStoredProducts() {
        return JSON.parse(localStorage.getItem('brisitasProducts')) || [];
    }

    function saveStoredProducts(products) {
        localStorage.setItem('brisitasProducts', JSON.stringify(products));
    }

    function generateOrderId() {
        var now = new Date();
        var pad = function(num) {
            return num.toString().padStart(2, '0');
        };
        var date = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate());
        var random = Math.floor(1000 + Math.random() * 9000);
        return 'BRI-' + date + '-' + random;
    }

    function saveOrder(order) {
        var orders = JSON.parse(localStorage.getItem('brisitasOrders')) || [];
        orders.unshift(order);
        localStorage.setItem('brisitasOrders', JSON.stringify(orders));
    }

    function showNotification(message) {
        var notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(function() {
            notification.classList.remove('show');
        }, 3000);
    }

    function initSlider() {
        var slider = document.querySelector('.slider');
        if (!slider) return;

        var slides = document.querySelectorAll('.slide');
        var dots = document.querySelectorAll('.dot');
        var prevBtn = document.querySelector('.prev-btn');
        var nextBtn = document.querySelector('.next-btn');

        var currentSlide = 0;
        var slideInterval = 5000;
        var slideTimer;

        function showSlide(index) {
            if (index >= slides.length) currentSlide = 0;
            else if (index < 0) currentSlide = slides.length - 1;
            else currentSlide = index;

            slides.forEach(function(slide, i) {
                slide.className = 'slide';
                if (i === currentSlide) {
                    slide.classList.add('active');
                } else if (i === currentSlide - 1 || (currentSlide === 0 && i === slides.length - 1)) {
                    slide.classList.add('prev');
                } else if (i === currentSlide + 1 || (currentSlide === slides.length - 1 && i === 0)) {
                    slide.classList.add('next');
                }
            });

            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentSlide);
            });

            clearTimeout(slideTimer);
            slideTimer = setTimeout(function() {
                showSlide(currentSlide + 1);
            }, slideInterval);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                showSlide(i);
            });
        });

        if (prevBtn) prevBtn.addEventListener('click', function() { showSlide(currentSlide - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function() { showSlide(currentSlide + 1); });

        var touchStartX = 0;
        var touchEndX = 0;
        var sliderContainer = document.querySelector('.slider-container');

        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderContainer.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            sliderContainer.addEventListener('mouseenter', function() {
                clearTimeout(slideTimer);
            });

            sliderContainer.addEventListener('mouseleave', function() {
                slideTimer = setTimeout(function() {
                    showSlide(currentSlide + 1);
                }, slideInterval);
            });
        }

        function handleSwipe() {
            var swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                showSlide(currentSlide + 1);
            } else if (touchEndX > touchStartX + swipeThreshold) {
                showSlide(currentSlide - 1);
            }
        }

        showSlide(0);
    }
});
