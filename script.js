/* ============================================================
   Lakshmi Ghee Stores — JavaScript
   Shopping Cart, Checkout, Animations, Navigation
   ============================================================ */

// ==================== CART STATE ====================
const cart = {
  items: [],
  
  addItem(product) {
    const existingIndex = this.items.findIndex(
      item => item.id === product.id && item.size === product.size
    );
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += product.quantity;
    } else {
      this.items.push({ ...product });
    }
    this.save();
    this.updateUI();
    showToast(`${product.name} (${product.size}) added to cart!`);
  },
  
  updateQuantity(index, delta) {
    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }
    this.save();
    this.updateUI();
  },
  
  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
    this.updateUI();
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  clear() {
    this.items = [];
    this.save();
    this.updateUI();
  },
  
  save() {
    localStorage.setItem('lakshmiGheeCart', JSON.stringify(this.items));
  },
  
  load() {
    const saved = localStorage.getItem('lakshmiGheeCart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
    this.updateUI();
  },
  
  updateUI() {
    // Update cart count badges
    document.querySelectorAll('.cart-count').forEach(el => {
      const count = this.getCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    
    // Render cart drawer items
    this.renderCartDrawer();
  },
  
  renderCartDrawer() {
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    
    if (!cartBody) return;
    
    if (this.items.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <span>Add some delicious ghee!</span>
        </div>
      `;
      cartFooter.style.display = 'none';
      return;
    }
    
    cartFooter.style.display = 'block';
    
    cartBody.innerHTML = this.items.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">${item.size}</div>
          <div class="cart-item-bottom">
            <div class="cart-item-qty">
              <button onclick="cart.updateQuantity(${index}, -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="cart.updateQuantity(${index}, 1)">+</button>
            </div>
            <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            <button class="cart-item-remove" onclick="cart.removeItem(${index})" title="Remove">✕</button>
          </div>
        </div>
      </div>
    `).join('');
    
    // Update totals
    const subtotal = this.getTotal();
    const delivery = subtotal > 0 ? 50 : 0;
    const total = subtotal + delivery;
    document.getElementById('cartSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('cartDelivery').textContent = `₹${delivery.toLocaleString('en-IN')}`;
    document.getElementById('cartTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  }
};

// ==================== PRODUCT DATA ====================
const products = {
  'cow-ghee': {
    id: 'cow-ghee',
    name: 'Pure Cow Ghee',
    image: 'images/cow-ghee.png',
    sizes: {
      '250g': 200,
      '500g': 400,
      '1 Kg': 800
    }
  },
  'buffalo-ghee': {
    id: 'buffalo-ghee',
    name: 'Pure Buffalo Ghee',
    image: 'images/buffalo-ghee.png',
    sizes: {
      '250g': 200,
      '500g': 400,
      '1 Kg': 800
    }
  }
};

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
  cart.load();
  initNavigation();
  initProductCards();
  initCartDrawer();
  initCheckout();
  initScrollAnimations();
  initSmoothScroll();
});

// ==================== NAVIGATION ====================
function initNavigation() {
  const header = document.querySelector('.header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = mobileNav.querySelectorAll('a');

  // Scroll effect
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Hamburger menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  });
}

// ==================== PRODUCT CARDS ====================
function initProductCards() {
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.product;
    const sizeOptions = card.querySelectorAll('.size-option');
    const qtyInput = card.querySelector('.qty-input');
    const qtyBtns = card.querySelectorAll('.qty-btn');
    const addToCartBtn = card.querySelector('.btn-cart');
    
    let selectedSize = sizeOptions[0]?.dataset.size || '250g';
    
    // Size selection
    sizeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        sizeOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedSize = opt.dataset.size;
      });
    });
    
    // Quantity buttons
    qtyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        let qty = parseInt(qtyInput.value);
        if (btn.dataset.action === 'increase') {
          qty = Math.min(qty + 1, 20);
        } else {
          qty = Math.max(qty - 1, 1);
        }
        qtyInput.value = qty;
      });
    });
    
    // Manual input
    qtyInput.addEventListener('change', () => {
      let qty = parseInt(qtyInput.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > 20) qty = 20;
      qtyInput.value = qty;
    });
    
    // Add to cart
    addToCartBtn.addEventListener('click', () => {
      const product = products[productId];
      if (!product) return;
      
      cart.addItem({
        id: product.id,
        name: product.name,
        image: product.image,
        size: selectedSize,
        price: product.sizes[selectedSize],
        quantity: parseInt(qtyInput.value)
      });
      
      // Reset quantity
      qtyInput.value = 1;
      
      // Button feedback
      addToCartBtn.innerHTML = '✓ Added!';
      addToCartBtn.style.background = 'linear-gradient(135deg, #2E8B57, #3CB371)';
      setTimeout(() => {
        addToCartBtn.innerHTML = '🛒 Add to Cart';
        addToCartBtn.style.background = '';
      }, 1500);
    });
  });
}

// ==================== CART DRAWER ====================
function initCartDrawer() {
  const cartBtns = document.querySelectorAll('.cart-btn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  
  function openCart() {
    cartOverlay.classList.add('active');
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeCart() {
    cartOverlay.classList.remove('active');
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  
  // Checkout button in cart
  document.getElementById('cartCheckoutBtn')?.addEventListener('click', () => {
    closeCart();
    setTimeout(() => openCheckout(), 300);
  });
  
  // WhatsApp order from cart
  document.getElementById('cartWhatsappBtn')?.addEventListener('click', () => {
    sendWhatsAppOrder();
  });
}

// ==================== CHECKOUT ====================
function initCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  const closeBtn = document.getElementById('checkoutClose');
  const form = document.getElementById('checkoutForm');
  
  closeBtn?.addEventListener('click', closeCheckout);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeCheckout();
  });
  
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCheckout();
  });
}

function openCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  renderOrderSummary();
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form after close animation
  setTimeout(() => {
    document.getElementById('checkoutForm')?.reset();
    document.getElementById('checkoutFormSection').style.display = 'block';
    document.getElementById('checkoutSuccessSection').style.display = 'none';
  }, 300);
}

function renderOrderSummary() {
  const container = document.getElementById('orderSummaryItems');
  if (!container) return;
  
  const subtotal = cart.getTotal();
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;
  
  container.innerHTML = cart.items.map(item => `
    <div class="order-summary-item">
      <span>${item.name} (${item.size}) × ${item.quantity}</span>
      <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('') + `
    <div class="order-summary-item">
      <span>🚚 Delivery Charges</span>
      <span>₹${delivery}</span>
    </div>
  `;
  
  document.getElementById('orderTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function handleCheckout() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  
  if (!name || !phone || !address) {
    showToast('Please fill in all required fields', true);
    return;
  }
  
  // Build WhatsApp message
  let message = `🛒 *New Order - Lakshmi Ghee Stores*\n\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📞 *Phone:* ${phone}\n`;
  message += `📍 *Address:* ${address}\n\n`;
  message += `📦 *Order Details:*\n`;
  
  cart.items.forEach(item => {
    message += `• ${item.name} (${item.size}) × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
  });
  
  const subtotal = cart.getTotal();
  const delivery = 50;
  const total = subtotal + delivery;
  
  message += `\n📦 *Subtotal: ₹${subtotal.toLocaleString('en-IN')}*\n`;
  message += `🚚 *Delivery: ₹${delivery}*\n`;
  message += `💰 *Total: ₹${total.toLocaleString('en-IN')}*\n`;
  message += `💳 *Payment:* Cash on Delivery / Online Payment`;
  
  // Show success
  document.getElementById('checkoutFormSection').style.display = 'none';
  document.getElementById('checkoutSuccessSection').style.display = 'block';
  
  // Open WhatsApp
  const whatsappUrl = `https://wa.me/918688585327?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  // Clear cart
  cart.clear();
}

function sendWhatsAppOrder() {
  if (cart.items.length === 0) return;
  
  let message = `🛒 *Order from Lakshmi Ghee Stores Website*\n\n📦 *Items:*\n`;
  
  cart.items.forEach(item => {
    message += `• ${item.name} (${item.size}) × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
  });
  
  const subtotal = cart.getTotal();
  const delivery = 50;
  const total = subtotal + delivery;
  
  message += `\n📦 *Subtotal: ₹${subtotal.toLocaleString('en-IN')}*\n`;
  message += `🚚 *Delivery: ₹${delivery}*\n`;
  message += `💰 *Total: ₹${total.toLocaleString('en-IN')}*\n`;
  message += `\nPlease confirm my order. 🙏`;
  
  const whatsappUrl = `https://wa.me/918688585327?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const top = target.offsetTop - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, isError = false) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${isError ? '⚠️' : '✅'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==================== DIRECT ACTIONS ====================
function callNow() {
  window.location.href = 'tel:+918688585327';
}

function whatsappOrder() {
  const message = `Hi! I'd like to order ghee from Lakshmi Ghee Stores. Please share the details. 🙏`;
  window.open(`https://wa.me/918688585327?text=${encodeURIComponent(message)}`, '_blank');
}
