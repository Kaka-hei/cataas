class CatSwipeApp {
    constructor() {
        this.cats = [];
        this.currentIndex = 0;
        this.likedCats = [];
        this.dislikedCats = [];
        this.isLoading = true;
        this.isMobile = this.detectMobile();
        
        this.cardStack = document.getElementById('cardStack');
        this.noCardsMessage = document.getElementById('noCardsMessage');
        this.summarySection = document.getElementById('summarySection');
        this.loading = document.getElementById('loading');
        this.restartBtn = document.getElementById('restartBtn');
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    async init() {
        try {
            await this.loadCats();
            this.setupEventListeners();
            this.renderCards();
            
            // Force show cards after 3 seconds for debugging
            setTimeout(() => {
                console.log('Force showing cards for debugging');
                this.showLoading(false);
                this.renderCards();
            }, 3000);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError();
        }
    }
    
    async loadCats() {
        this.showLoading(true);
        
        try {
            // Load 20 cats from Cat as a Service API
            const promises = Array.from({ length: 20 }, () => this.fetchCatImage());
            this.cats = await Promise.all(promises);
            console.log('Loaded cats:', this.cats.length);
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading cats:', error);
            this.showLoading(false);
            throw error;
        }
    }
    
    async fetchCatImage() {
        try {
            // Add unique parameters to prevent caching and get different images
            const uniqueId = Math.random().toString(36).substr(2, 9);
            const timestamp = Date.now();
            const response = await fetch(`https://cataas.com/cat?width=400&height=500&t=${timestamp}&id=${uniqueId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch cat image');
            }
            return {
                id: timestamp + Math.random(),
                url: response.url,
                timestamp: timestamp
            };
        } catch (error) {
            console.error('Error fetching cat image:', error);
            // Return a placeholder image if API fails
            return {
                id: Date.now() + Math.random(),
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIENhdCBJbWFnZTwvdGV4dD4KPC9zdmc+',
                timestamp: Date.now()
            };
        }
    }
    
    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restart());
    }
    
    renderCards() {
        console.log('Rendering cards, currentIndex:', this.currentIndex, 'cats.length:', this.cats.length);
        this.cardStack.innerHTML = '';
        
        if (this.cats.length === 0) {
            console.log('No cats to render, showing no cards message');
            this.showNoCardsMessage();
            return;
        }
        
        // Show up to 3 cards at a time
        const cardsToShow = Math.min(3, this.cats.length - this.currentIndex);
        console.log('Cards to show:', cardsToShow);
        
        for (let i = 0; i < cardsToShow; i++) {
            const catIndex = this.currentIndex + i;
            if (catIndex >= this.cats.length) break;
            
            const card = this.createCard(this.cats[catIndex], i);
            this.cardStack.appendChild(card);
        }
        
        console.log('Cards rendered, cardStack children:', this.cardStack.children.length);
        
        // Debug DOM state
        console.log('Card stack display:', this.cardStack.style.display);
        console.log('Card stack visibility:', window.getComputedStyle(this.cardStack).visibility);
        console.log('Card stack opacity:', window.getComputedStyle(this.cardStack).opacity);
        
        // Debug container dimensions
        const swipeContainer = document.getElementById('swipeContainer');
        console.log('Swipe container dimensions:', {
            width: swipeContainer.offsetWidth,
            height: swipeContainer.offsetHeight,
            top: swipeContainer.offsetTop,
            left: swipeContainer.offsetLeft
        });
        
        console.log('Card stack dimensions:', {
            width: this.cardStack.offsetWidth,
            height: this.cardStack.offsetHeight,
            top: this.cardStack.offsetTop,
            left: this.cardStack.offsetLeft
        });
        
        if (this.cardStack.children.length > 0) {
            const firstCard = this.cardStack.children[0];
            console.log('First card display:', window.getComputedStyle(firstCard).display);
            console.log('First card visibility:', window.getComputedStyle(firstCard).visibility);
            console.log('First card opacity:', window.getComputedStyle(firstCard).opacity);
            console.log('First card position:', window.getComputedStyle(firstCard).position);
            
            console.log('First card dimensions:', {
                width: firstCard.offsetWidth,
                height: firstCard.offsetHeight,
                top: firstCard.offsetTop,
                left: firstCard.offsetLeft
            });
            
            // Check if card is actually in viewport
            const rect = firstCard.getBoundingClientRect();
            console.log('First card bounding rect:', {
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right,
                width: rect.width,
                height: rect.height
            });
        }
    }
    
    createCard(cat, zIndex) {
        console.log('Creating card for cat:', cat.id);
        const card = document.createElement('div');
        card.className = 'cat-card';
        card.style.zIndex = 10 - zIndex;
        card.style.transform = `scale(${1 - zIndex * 0.05}) translateY(${zIndex * 5}px)`;
        

        
        const img = document.createElement('img');
        img.src = cat.url;
        img.alt = 'Cat';
        img.draggable = false;
        
        // Add image load event listener
        img.onload = () => {
            console.log('Image loaded successfully:', cat.url);
        };
        
        img.onerror = () => {
            console.error('Image failed to load:', cat.url);
        };
        
        card.appendChild(img);
        
        // Add touch/mouse event listeners
        this.addSwipeListeners(card, cat);
        
        console.log('Card created and ready');
        return card;
    }
    
    addSwipeListeners(card, cat) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let velocity = 0;
        let lastMoveTime = 0;
        let lastMoveX = 0;
        let touchStartTime = 0;
        
        // Touch events - optimized for mobile
        card.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return; // Ignore multi-touch
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            currentY = startY;
            isDragging = true;
            velocity = 0;
            lastMoveTime = Date.now();
            lastMoveX = startX;
            touchStartTime = Date.now();
            card.style.transition = 'none';
            
            // Add haptic feedback on mobile
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length > 1) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // More sensitive horizontal detection for mobile
            if (Math.abs(deltaX) > Math.abs(deltaY) * 0.5) {
                e.preventDefault();
                
                // Calculate velocity for momentum
                const now = Date.now();
                const timeDiff = now - lastMoveTime;
                if (timeDiff > 0) {
                    velocity = (currentX - lastMoveX) / timeDiff;
                }
                lastMoveTime = now;
                lastMoveX = currentX;
                
                this.updateCardPosition(card, deltaX);
            }
        }, { passive: false });
        
        card.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            const touchDuration = Date.now() - touchStartTime;
            
            // Adjust thresholds for mobile
            const threshold = this.isMobile ? 60 : 80;
            const velocityThreshold = this.isMobile ? 0.2 : 0.3;
            
            this.handleSwipeEnd(card, cat, deltaX, velocity, threshold, velocityThreshold);
            isDragging = false;
        }, { passive: true });
        
        // Mouse events for desktop
        card.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            currentX = startX;
            currentY = startY;
            isDragging = true;
            velocity = 0;
            lastMoveTime = Date.now();
            lastMoveX = startX;
            card.style.transition = 'none';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX;
            currentY = e.clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                
                // Calculate velocity for momentum
                const now = Date.now();
                const timeDiff = now - lastMoveTime;
                if (timeDiff > 0) {
                    velocity = (currentX - lastMoveX) / timeDiff;
                }
                lastMoveTime = now;
                lastMoveX = currentX;
                
                this.updateCardPosition(card, deltaX);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            this.handleSwipeEnd(card, cat, deltaX, velocity);
            isDragging = false;
        });
        
        // Prevent default drag behavior
        card.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    updateCardPosition(card, deltaX) {
        const rotation = deltaX * 0.1;
        card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        
        // Enhanced visual feedback for mobile
        if (deltaX > 50) {
            card.style.backgroundColor = '#e8f5e8'; // Light green for like
            card.style.boxShadow = '0 15px 40px rgba(76, 175, 80, 0.3)';
        } else if (deltaX < -50) {
            card.style.backgroundColor = '#ffe8e8'; // Light red for dislike
            card.style.boxShadow = '0 15px 40px rgba(244, 67, 54, 0.3)';
        } else {
            card.style.backgroundColor = 'white';
            card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        }
        
        // Add mobile-specific visual cues
        if (this.isMobile) {
            const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 200);
            card.style.opacity = opacity;
        }
    }
    
    handleSwipeEnd(card, cat, deltaX, velocity, threshold = 80, velocityThreshold = 0.3) {
        // Consider both distance and velocity for swipe detection
        const shouldLike = deltaX > threshold || (deltaX > 30 && velocity > velocityThreshold);
        const shouldDislike = deltaX < -threshold || (deltaX < -30 && velocity < -velocityThreshold);
        
        if (shouldLike) {
            // Swipe right - Like
            this.likeCat(card, cat);
        } else if (shouldDislike) {
            // Swipe left - Dislike
            this.dislikeCat(card, cat);
        } else {
            // Return to center with smooth animation
            this.resetCardPosition(card);
        }
    }
    
    likeCat(card, cat) {
        this.likedCats.push(cat);
        card.classList.add('like');
        
        setTimeout(() => {
            this.nextCard();
        }, 300);
    }
    
    dislikeCat(card, cat) {
        this.dislikedCats.push(cat);
        card.classList.add('dislike');
        
        setTimeout(() => {
            this.nextCard();
        }, 300);
    }
    
    resetCardPosition(card) {
        card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
        card.style.transform = '';
        card.style.backgroundColor = 'white';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        card.style.opacity = '1';
        
        // Remove transition after animation completes
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    }
    
    nextCard() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.cats.length) {
            this.showSummary();
        } else {
            this.renderCards();
        }
    }
    
    showSummary() {
        this.cardStack.style.display = 'none';
        this.noCardsMessage.style.display = 'flex';
        
        // Show the "No more cats!" message first
        setTimeout(() => {
            this.noCardsMessage.style.display = 'none';
            this.summarySection.style.display = 'block';
        }, 2000); // Show message for 2 seconds before showing summary
        
        // Update stats
        document.getElementById('likedCount').textContent = this.likedCats.length;
        document.getElementById('dislikedCount').textContent = this.dislikedCats.length;
        
        // Show liked cats
        const likedGrid = document.getElementById('likedGrid');
        likedGrid.innerHTML = '';
        
        this.likedCats.forEach(cat => {
            const likedCatDiv = document.createElement('div');
            likedCatDiv.className = 'liked-cat';
            
            const img = document.createElement('img');
            img.src = cat.url;
            img.alt = 'Liked cat';
            
            likedCatDiv.appendChild(img);
            likedGrid.appendChild(likedCatDiv);
        });
    }
    
    showNoCardsMessage() {
        this.cardStack.style.display = 'none';
        this.noCardsMessage.style.display = 'flex';
    }
    
    showLoading(show) {
        console.log('showLoading called with:', show);
        
        if (show) {
            this.loading.style.display = 'flex';
            this.loading.style.visibility = 'visible';
            this.loading.style.opacity = '1';
            this.isLoading = show;
            this.startLoadingAnimation();
        } else {
            // Aggressively hide loading screen
            console.log('Hiding loading, showing cards');
            this.loading.style.display = 'none';
            this.loading.style.visibility = 'hidden';
            this.loading.style.opacity = '0';
            this.loading.style.zIndex = '-1';
            
            // Ensure card stack is visible when loading is done
            this.cardStack.style.display = 'block';
            this.cardStack.style.zIndex = '10';
            this.cardStack.style.visibility = 'visible';
            this.cardStack.style.opacity = '1';
            
            // Debug loading screen state
            console.log('Loading screen display:', this.loading.style.display);
            console.log('Loading screen computed display:', window.getComputedStyle(this.loading).display);
            console.log('Loading screen visibility:', window.getComputedStyle(this.loading).visibility);
            console.log('Loading screen opacity:', window.getComputedStyle(this.loading).opacity);
        }
    }
    
    startLoadingAnimation() {
        const dotsElement = this.loading.querySelector('.loading-dots');
        if (dotsElement) {
            let dots = '';
            const interval = setInterval(() => {
                if (!this.isLoading) {
                    clearInterval(interval);
                    return;
                }
                dots = dots.length >= 3 ? '' : dots + '.';
                dotsElement.textContent = dots;
            }, 500);
        }
    }
    
    showError() {
        this.loading.innerHTML = `
            <div style="color: #e74c3c; font-size: 1.2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">😿</div>
                <p style="font-weight: 600; margin-bottom: 10px;">Oops! Something went wrong</p>
                <p style="font-size: 0.9rem; color: #666; margin: 0;">Please check your internet connection and try again.</p>
            </div>
        `;
    }
    
    async restart() {
        this.currentIndex = 0;
        this.likedCats = [];
        this.dislikedCats = [];
        
        this.summarySection.style.display = 'none';
        this.cardStack.style.display = 'block';
        this.noCardsMessage.style.display = 'none';
        
        try {
            await this.loadCats();
            this.renderCards();
        } catch (error) {
            console.error('Error restarting app:', error);
            this.showError();
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CatSwipeApp();
});
