// Element references
const ingredientInput = document.querySelector('#ingredient-input');
const ingredientForm = document.querySelector('#ingredient-form');
const mealName = document.querySelector('#meal-name');
const mealImage = document.querySelector('#meal-image');
const ordersList = document.querySelector('#orders-list');
const completeOrderForm = document.querySelector('#complete-order-form');
const orderNumberInput = document.getElementById('order-number');
const mealSuggestionsSection = document.getElementById('suggestions-section');
const suggestionHeadingContainer = document.getElementById('suggestion-heading-container');
const suggestionError = document.getElementById('suggestion-error');
const suggestionCardContainer = document.getElementById('suggestion-card-container');
const ordersButton = document.getElementById('orders-button');
const ordersSection = document.getElementById('orders-section');
const clearOrdersBtn = document.getElementById('clear-orders');

// TOAST logic
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    console.log('Showing toast:', message, toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}


// Toggle orders section visibility and update button text
ordersButton.addEventListener('click', () => {
    ordersSection.classList.toggle('d-none');
    if (ordersSection.classList.contains('d-none')) {
        ordersButton.firstChild.textContent = 'Show Orders ';
    } else {
        ordersButton.firstChild.textContent = 'Hide Orders ';
    }
});


// Handle ingredient form submission
ingredientForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const inputValue = ingredientInput.value.trim();
    if (!inputValue) {
        showToast('Please enter an ingredient', 'danger');
        return;
    }
    const formattedInput = inputValue.toLowerCase().replace(/\s+/g, "_");

    fetchMeal(formattedInput);
    displaySuggestions(formattedInput);
});

// Fetch a random meal based on ingredient 
function fetchMeal(ingredient) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals === null) {
                mealName.innerHTML = "No meal found";
                mealImage.src = '';
                return;
            }
            const randMealIndex = Math.floor(Math.random() * data.meals.length);
            const meal = data.meals[randMealIndex];
            mealName.innerHTML = meal.strMeal;
            mealImage.src = meal.strMealThumb;

            const favContainer = document.getElementById("chefs-fav-container");

            // Remove existing button if one already exists
            const existingButton = favContainer.querySelector(".order-chef-fav-btn");
            if (existingButton) {
                existingButton.remove(); // Ensure only one button exists at a time
            }

            // Create a new "Order Now" button
            const orderButton = document.createElement("button");
            orderButton.className = "btn btn-danger order-chef-fav-btn";
            orderButton.textContent = "Order Now";

            // Add click event to order meal
            orderButton.addEventListener("click", () => {
                addOrder(meal); // Calls function to handle order
                showToast(`Ordered: ${meal.strMeal}`, 'success');
                orderButton.disabled = true; // Prevents further clicks
                orderButton.textContent = "Order Placed!";
            });

            favContainer.appendChild(orderButton); // Append button to container
        })
        .catch(err => console.error("Fetch error:", err));
}

// Display meal suggestions as clickable cards
function displaySuggestions(ingredient) {
    suggestionCardContainer.innerHTML = "";
    suggestionHeadingContainer.innerHTML = "";
    suggestionError.innerHTML = "";

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals === null) {
                suggestionError.innerHTML = "No meals found for that ingredient. Please try another one.";
                return;
            }

            let suggestionHeading = document.createElement('h4');
            suggestionHeading.id = 'suggestion-heading';
            suggestionHeading.innerHTML = `Meals containing ${ingredientInput.value.toLowerCase()}:`;
            suggestionHeading.classList.add('animate-fancyFadeScale');
            suggestionHeadingContainer.appendChild(suggestionHeading);

            data.meals.forEach((meal, index) => {
                // Creating meal card
                const card = document.createElement('div');
                card.className = 'suggestion-card card shadow-lg rounded-4';
                card.style.flex = '1 1 180px';
                card.style.cursor = 'pointer';
                card.style.opacity = '0';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.transform = 'scale(0.9)';
                
                // Creating meal image
                const img = document.createElement('img');
                img.src = meal.strMealThumb;
                img.className = 'card-img-top';
                img.alt = meal.strMeal;

                // Creating card body
                const body = document.createElement('div');
                body.className = 'card-body text-center';

                // Creating card title (meal name)
                const title = document.createElement('h6');
                title.className = 'suggestion-card-title card-title text-center fw-semibold mt-2';
                title.textContent = meal.strMeal;

                // Append newly created elements
                body.appendChild(title);
                card.appendChild(img);
                card.appendChild(body);


                // Create the plus button
                const plusBtn = document.createElement('button');
                plusBtn.className = 'btn btn-sm plus-icon'; 
                plusBtn.style.borderRadius = '50%';
                plusBtn.style.width = '1.875rem';
                plusBtn.style.height = '1.875rem';
                plusBtn.style.padding = '0';
                plusBtn.style.justifyContent = 'center';
                plusBtn.style.alignItems = 'center';
                plusBtn.style.display = 'inline-flex';
                plusBtn.title = 'Add to orders';

                // Use a plus sign as content 
                plusBtn.innerHTML = '<i class="bi bi-plus"></i>';

                // Creating card footer (add to order section)
                const footer = document.createElement('div');
                footer.className = 'card-footer bg-transparent border-0 text-end w-100';
                footer.appendChild(plusBtn);
                card.appendChild(footer);

                // Add click event only to plusBtn
                plusBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent bubbling in case card has other handlers
                    addOrder(meal);
                    showToast(`Ordered: ${meal.strMeal}`, 'success');
                });

                card.style.position = 'relative';

                suggestionCardContainer.appendChild(card);

                // Delay transformation
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, index * 200);
            });

            // Wait until all cards are rendered before setting card height
            const animationDelay = 200 * data.meals.length;
            setTimeout(() => {
                normalizeCardHeights();
            }, animationDelay + 400);
        })
        .catch(err => console.error("Fetch error:", err));
}

// Add an order to sessionStorage and update display
function addOrder(meal) {
    const orders = getOrders();
    let lastOrder = getLastOrderNumber();

    // Order details
    const newOrder = {
        orderNumber: ++lastOrder,
        description: meal.strMeal,
        image: meal.strMealThumb,
        complete: false,
        timestamp: new Date().toLocaleString()
    };

    // Add to orders
    orders.push(newOrder);
    saveOrders(orders);
    setLastOrderNumber(lastOrder);

    // Display order and update order number
    displayOrders();
    updateOrderCount();
}

// Display all orders in the orders list
function displayOrders() {
    const orders = getOrders();
    ordersList.innerHTML = '';

    // Display message if no orders exist and return
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="text-center mt-3">No current orders.</p>';
        updateOrderCount();
        return;
    }

    //  Create a list of orders 
    orders.forEach(order => {
        const orderItem = document.createElement('li');
        orderItem.className = 'list-group-item d-flex align-items-center justify-content-between';

        orderItem.style.height = "80px";
        orderItem.style.display = "flex";
        orderItem.style.alignItems = "center";
        orderItem.style.justifyContent = "space-between";
        orderItem.style.overflow = "hidden";

        // Order info container
        const orderInfo = document.createElement('div');
        orderInfo.className = 'order-info d-flex align-items-center';

        // Image of meal ordered
        const img = document.createElement('img');
        img.src = order.image;
        img.alt = order.description;
        img.style.width = '50px';
        img.style.height = '50px';
        img.classList.add('me-3', 'rounded');

        // Description of order
        const desc = document.createElement('div');
        desc.className = 'order-wrapper';
        desc.innerHTML = `<strong class="order-number">#${order.orderNumber}</strong> ${order.description}<br><small class="timestamp">${order.timestamp}</small>`;

        orderInfo.appendChild(img);
        orderInfo.appendChild(desc);

        // Create a container for control buttons
        const controls = document.createElement('div');
        controls.className = 'controls';

       
        if (!order.complete) {
            const completeBtn = document.createElement('button');
            completeBtn.className = 'btn btn-success btn-sm me-2 complete-single-order-btn';
            completeBtn.innerHTML =  '<i class="bi bi-check-lg"></i>';
            completeBtn.addEventListener('click', () => markOrderComplete(order.orderNumber));
            controls.appendChild(completeBtn);
        } else {
            // Add a badge marking order complete
            const completeBadge = document.createElement('span');
            completeBadge.className = 'badge bg-success me-2';
            completeBadge.textContent = 'Completed';
            controls.appendChild(completeBadge);
        }

        // Create delete btn
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm delete-btn';
        deleteBtn.innerHTML = '<i class="bi bi-dash"></i>';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Delete order #${order.orderNumber}?`)) {
                deleteOrder(order.orderNumber);
                showToast(`Order #${order.orderNumber} deleted`, 'danger');
            }
        });

        controls.appendChild(deleteBtn);
        orderItem.appendChild(orderInfo);
        orderItem.appendChild(controls);
        ordersList.appendChild(orderItem);
    });

    updateOrderCount();
}

// Mark an order as complete
function markOrderComplete(orderNumber) {
    const orders = getOrders();
    const index = orders.findIndex(order => order.orderNumber === orderNumber);

    // If no order number is found, show TOAST and return
    if (index === -1) {
        showToast('Order number not found.', 'danger')
        return;
    }

    // If order is already completed, show TOAST and return
    if (orders[index].complete) {
        showToast('This order is already marked complete.', 'danger')
        return;
    }

    // Mark order complete
    orders[index].complete = true;
    saveOrders(orders);
    showToast(`Order #${orderNumber} marked as complete.`, 'success')
    displayOrders();
}

// Delete an order by orderNumber
function deleteOrder(orderNumber) {
    let orders = getOrders();
    orders = orders.filter(order => order.orderNumber !== orderNumber);
    saveOrders(orders);
    displayOrders();
}

// Utility: Get orders from sessionStorage
function getOrders() {
    return JSON.parse(sessionStorage.getItem('orders')) || [];
}

// Utility: Save orders to sessionStorage
function saveOrders(orders) {
    sessionStorage.setItem('orders', JSON.stringify(orders));
}

// Utility: Get last order number from sessionStorage
function getLastOrderNumber() {
    return parseInt(sessionStorage.getItem('lastOrderNumber')) || 0;
}

// Utility: Set last order number in sessionStorage
function setLastOrderNumber(number) {
    sessionStorage.setItem('lastOrderNumber', number.toString());
}

// Normalize suggestion cards height for consistent UI
function normalizeCardHeights() {
    const cards = document.querySelectorAll(".suggestion-card");
    let maxHeight = 0;
    cards.forEach(card => {
        let cardHeight = card.offsetHeight;
        if (cardHeight > maxHeight) maxHeight = cardHeight;
    });
    cards.forEach(card => card.style.height = `${maxHeight}px`);
}

// Update the order count badge
function updateOrderCount() {
    const orders = getOrders();
    const orderCountSpan = document.getElementById('order-count');
    if (orderCountSpan) {
        orderCountSpan.textContent = orders.length;
    }
}

// Complete order form submission handling 
completeOrderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const number = parseInt(orderNumberInput.value);
    if (!number) {
        showToast('No order number entered.', 'danger')
        return;
    }
    markOrderComplete(number);
    orderNumberInput.value = "";
});

// Clear all orders button
clearOrdersBtn.addEventListener('click', function () {
    const currentOrders = getOrders();
    if (currentOrders.length === 0) {
        showToast('There are no orders to clear.', 'danger')
        return;
    }
    if (confirm("Are you sure you want to clear all orders?")) {
        sessionStorage.removeItem('orders');
        sessionStorage.removeItem('lastOrderNumber');
        displayOrders();
    }
});

// Initialize on page load
window.addEventListener('load', () => {
    displayOrders();
    updateOrderCount();
});





