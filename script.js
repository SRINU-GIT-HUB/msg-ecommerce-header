// Wait for HTML to load before running Javascript
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. ANNOUNCEMENT BAR ---
    const messages = [
        "Free Shipping on orders over ₹999",
        "Save 20% on your first order!",
        "Flash Sale: Electronics up to 50% off"
    ];
    let msgIndex = 0;
    const textElement = document.getElementById('announcement-text');
    const barElement = document.getElementById('announcement-bar');
    
    // Check if user previously closed it
    if (localStorage.getItem('hideBanner') === 'true') {
        barElement.style.display = 'none';
    } else {
        // Show first message
        textElement.innerText = messages[msgIndex];
        
        // Change message every 4 seconds
        setInterval(function() {
            msgIndex++;
            if (msgIndex >= messages.length) msgIndex = 0; // Loop back to start
            textElement.innerText = messages[msgIndex];
        }, 4000);
    }

    // Close button logic
    document.getElementById('close-bar').addEventListener('click', function() {
        barElement.style.display = 'none';
        localStorage.setItem('hideBanner', 'true'); // Remember choice
    });


    // --- 2. SEARCH FORM ---
    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Stop page from refreshing
        const input = document.getElementById('search-input').value;
        const category = document.getElementById('search-category').value;
        
        if (input.trim() === '') {
            alert('Please type something to search.');
        } else {
            alert('Searching for "' + input + '" in ' + category);
        }
    });


    // --- 3. CATEGORY STRIP (MORE DROPDOWN) ---
    function adjustMenu() {
        const mainMenu = document.getElementById('main-menu');
        const moreMenu = document.getElementById('more-menu');
        const dropdown = document.getElementById('more-dropdown');
        
        // Step A: Put everything back into the main menu first
        while (moreMenu.children.length > 0) {
            mainMenu.appendChild(moreMenu.children[0]);
        }
        dropdown.style.display = 'none'; // Hide dropdown

        // Mobile handles overflow with scrolling, so stop here
        if (window.innerWidth <= 768) return;

        // Step B: If the menu is wider than its container, move last items to dropdown
        while (mainMenu.scrollWidth > mainMenu.clientWidth && mainMenu.children.length > 0) {
            dropdown.style.display = 'block'; // Show dropdown
            moreMenu.insertBefore(mainMenu.lastElementChild, moreMenu.firstChild);
        }
    }
    
    window.addEventListener('resize', adjustMenu);
    adjustMenu(); // Run once on load


    // --- 4. CART DATA & RENDERING ---
    // Standard currency format for India
    const formatMoney = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    
    // Sample cart data
    let cart = [
        { id: 1, name: "Wireless Headphones", price: 2999, qty: 1, img: "https://via.placeholder.com/60" },
        { id: 2, name: "Smart Watch", price: 4999, qty: 2, img: "https://via.placeholder.com/60" },
        { id: 3, name: "Power Bank", price: 999, qty: 1, img: "https://via.placeholder.com/60" }
    ];

    function renderCart() {
        const container = document.getElementById('cart-items-container');
        container.innerHTML = ''; // Clear old HTML
        
        let totalItems = 0;
        let subtotal = 0;

        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        } else {
            // Loop through each item and create HTML
            cart.forEach(function(item, index) {
                totalItems += item.qty;
                subtotal += (item.price * item.qty);

                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.img}" class="item-img" alt="product">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">${formatMoney.format(item.price)}</div>
                            <div class="qty-box">
                                <button onclick="changeQty(${index}, -1)" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
                                <span>${item.qty}</span>
                                <button onclick="changeQty(${index}, 1)" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>
                        <button class="remove-btn" onclick="removeItem(${index})" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
            });
        }

        // Update totals
        document.getElementById('cart-subtotal').innerText = formatMoney.format(subtotal);
        
        // Update badge and trigger animation
        const badge = document.getElementById('cart-badge');
        if (badge.innerText != totalItems) {
            badge.innerText = totalItems;
            badge.classList.remove('pop');
            void badge.offsetWidth; // Force browser to restart animation
            badge.classList.add('pop');
        }
    }

    // --- 5. CART ACTIONS ---
    // Make functions available globally so HTML onclick="" can find them
    window.changeQty = function(index, amount) {
        if (amount === -1 && cart[index].qty === 1) return; // Don't go below 1
        cart[index].qty += amount;
        renderCart();
    };

    window.removeItem = function(index) {
        cart.splice(index, 1); // Remove 1 item at this index
        renderCart();
    };

    renderCart(); // Render cart on page load


    // --- 6. OPEN / CLOSE CART LOGIC ---
    const cartElement = document.getElementById('mini-cart');
    const overlayElement = document.getElementById('overlay');
    const cartBtn = document.getElementById('cart-btn');

    function openCart() {
        cartElement.classList.add('open');
        overlayElement.classList.add('show');
        cartElement.removeAttribute('inert'); // Allow screen readers inside
        cartBtn.setAttribute('aria-expanded', 'true');
        document.getElementById('close-cart').focus(); // Move keyboard focus inside
    }

    function closeCart() {
        cartElement.classList.remove('open');
        overlayElement.classList.remove('show');
        cartElement.setAttribute('inert', 'true'); // Hide from screen readers
        cartBtn.setAttribute('aria-expanded', 'false');
        cartBtn.focus(); // Give focus back to main button
    }

    cartBtn.addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    overlayElement.addEventListener('click', closeCart);

    // Keyboard Accessibility
    document.addEventListener('keydown', function(event) {
        // Press Escape to close
        if (event.key === 'Escape' && cartElement.classList.contains('open')) {
            closeCart();
        }
    });

    // Focus Trap: Keep keyboard "Tab" presses trapped inside the cart when open
    cartElement.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            const buttons = cartElement.querySelectorAll('button, a');
            const firstElement = buttons[0];
            const lastElement = buttons[buttons.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });

});