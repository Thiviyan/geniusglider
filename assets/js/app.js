/**
 * Geniusglider IT Services - Main Application JavaScript
 * Performance-optimized, accessibility-first interactive features
 */

(function() {
    'use strict';

    // ===== CONFIGURATION & CONSTANTS =====
    const CONFIG = {
        animationDuration: 300,
        scrollThreshold: 100,
        apiEndpoints: {
            submitForm: '/api/consultation',
            calculateROI: '/api/roi-calculator'
        },
        analytics: {
            gtag: window.gtag || function() {},
            trackEvent: (action, category, label, value) => {
                if (typeof window.gtag === 'function') {
                    window.gtag('event', action, {
                        event_category: category,
                        event_label: label,
                        value: value
                    });
                }
            }
        }
    };

    // ===== UTILITY FUNCTIONS =====
    const Utils = {
        // Debounce function for performance optimization
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
        throttle: (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Format currency values
        formatCurrency: (amount, currency = 'INR') => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        },

        // Validate email with business domain suggestions
        validateBusinessEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const businessDomains = [
                'company.com', 'business.com', 'corp.com', 'enterprise.com',
                'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'
            ];

            if (!emailRegex.test(email)) {
                return { valid: false, suggestion: null };
            }

            const domain = email.split('@')[1];
            const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

            if (personalDomains.includes(domain)) {
                const companyName = email.split('@')[0].replace(/[0-9]/g, '');
                return {
                    valid: true,
                    suggestion: `${companyName}@company.com`,
                    isPersonal: true
                };
            }

            return { valid: true, suggestion: null, isPersonal: false };
        },

        // Animate number counting
        animateNumber: (element, target, duration = 2000) => {
            const start = 0;
            const startTime = Date.now();

            const update = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                const current = Math.round(start + (target - start) * eased);

                element.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            update();
        },

        // Intersection Observer for animations
        createObserver: (callback, options = {}) => {
            const defaultOptions = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            };

            return new IntersectionObserver(callback, { ...defaultOptions, ...options });
        }
    };

    // ===== NAVIGATION FUNCTIONALITY =====
    class Navigation {
        constructor() {
            this.header = document.querySelector('.header');
            this.navToggle = document.querySelector('.nav-toggle');
            this.navMenu = document.querySelector('.nav-menu');
            this.navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
            this.lastScrollTop = 0;

            this.init();
        }

        init() {
            this.bindEvents();
            this.setupSmoothScrolling();
            this.setupScrollBehavior();
        }

        bindEvents() {
            // Mobile menu toggle
            if (this.navToggle && this.navMenu) {
                this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
            }

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMobileMenu();
                }
            });

            // Scroll behavior
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 16));
        }

        toggleMobileMenu() {
            const isOpen = this.navMenu.classList.contains('active');

            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.navMenu.classList.add('active');
            this.navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';

            // Focus first menu item
            const firstMenuItem = this.navMenu.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }

        closeMobileMenu() {
            this.navMenu.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        setupSmoothScrolling() {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        this.closeMobileMenu();
                        this.scrollToElement(targetElement);

                        // Track navigation click
                        CONFIG.analytics.trackEvent('click', 'navigation', targetId);
                    }
                });
            });
        }

        scrollToElement(element) {
            const headerHeight = this.header.offsetHeight;
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementTop - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        setupScrollBehavior() {
            // Header show/hide on scroll
            this.handleScroll();
        }

        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Hide/show header based on scroll direction
            if (scrollTop > this.lastScrollTop && scrollTop > CONFIG.scrollThreshold) {
                // Scrolling down
                this.header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.header.style.transform = 'translateY(0)';
            }

            this.lastScrollTop = scrollTop;
        }
    }

    // ===== HERO ANIMATIONS =====
    class HeroAnimations {
        constructor() {
            this.heroStats = document.querySelectorAll('.stat-number');
            this.init();
        }

        init() {
            this.animateStatsOnScroll();
        }

        animateStatsOnScroll() {
            if (!this.heroStats.length) return;

            const observer = Utils.createObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                        const target = parseInt(entry.target.getAttribute('data-target'));
                        Utils.animateNumber(entry.target, target);
                        entry.target.setAttribute('data-animated', 'true');
                    }
                });
            });

            this.heroStats.forEach(stat => observer.observe(stat));
        }
    }

    // ===== ROI CALCULATOR =====
    class ROICalculator {
        constructor() {
            this.calculatorTabs = document.querySelectorAll('.tab-btn');
            this.calculatorPanels = document.querySelectorAll('.calculator-panel');
            this.inputs = {
                incidents: document.getElementById('incidents'),
                resolutionTime: document.getElementById('resolution-time'),
                employeeCount: document.getElementById('employee-count'),
                hourlyCost: document.getElementById('hourly-cost')
            };
            this.results = {
                currentCost: document.getElementById('current-cost'),
                potentialSavings: document.getElementById('potential-savings'),
                annualSavings: document.getElementById('annual-savings'),
                roiPercentage: document.getElementById('roi-percentage')
            };

            this.init();
        }

        init() {
            this.bindEvents();
            this.calculateROI(); // Initial calculation
        }

        bindEvents() {
            // Tab switching
            this.calculatorTabs.forEach(tab => {
                tab.addEventListener('click', (e) => this.switchTab(e.target));
            });

            // Input changes
            Object.values(this.inputs).forEach(input => {
                if (input) {
                    input.addEventListener('input', Utils.debounce(() => {
                        this.calculateROI();
                        this.trackCalculatorUsage();
                    }, 300));
                }
            });
        }

        switchTab(clickedTab) {
            const targetPanel = clickedTab.getAttribute('aria-controls');

            // Update tab states
            this.calculatorTabs.forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            });
            clickedTab.classList.add('active');
            clickedTab.setAttribute('aria-selected', 'true');

            // Update panel visibility
            this.calculatorPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            const targetElement = document.getElementById(targetPanel);
            if (targetElement) {
                targetElement.classList.add('active');
            }

            // Track tab switch
            CONFIG.analytics.trackEvent('click', 'calculator_tab', targetPanel);
        }

        calculateROI() {
            const incidents = parseInt(this.inputs.incidents?.value) || 0;
            const resolutionTime = parseFloat(this.inputs.resolutionTime?.value) || 0;
            const employeeCount = parseInt(this.inputs.employeeCount?.value) || 0;
            const hourlyCost = parseInt(this.inputs.hourlyCost?.value) || 0;

            // Calculate current monthly cost
            const monthlyDowntimeHours = incidents * resolutionTime;
            const monthlyProductivityLoss = monthlyDowntimeHours * employeeCount * hourlyCost;
            const currentMonthlyCost = monthlyProductivityLoss;

            // Calculate potential savings (assuming 80% reduction in incidents and 70% faster resolution)
            const improvedIncidents = Math.ceil(incidents * 0.2); // 80% reduction
            const improvedResolutionTime = resolutionTime * 0.3; // 70% faster
            const improvedDowntimeHours = improvedIncidents * improvedResolutionTime;
            const improvedProductivityLoss = improvedDowntimeHours * employeeCount * hourlyCost;

            const potentialMonthlySavings = currentMonthlyCost - improvedProductivityLoss;
            const annualSavings = potentialMonthlySavings * 12;

            // Estimate our service cost (30% of current IT budget)
            const estimatedServiceCost = currentMonthlyCost * 0.3;
            const netSavings = potentialMonthlySavings - estimatedServiceCost;
            const roiPercentage = estimatedServiceCost > 0 ? ((netSavings * 12) / (estimatedServiceCost * 12)) * 100 : 0;

            // Update display
            this.updateResults({
                currentCost: currentMonthlyCost,
                potentialSavings: Math.max(0, potentialMonthlySavings),
                annualSavings: Math.max(0, annualSavings),
                roiPercentage: Math.max(0, roiPercentage)
            });
        }

        updateResults(calculations) {
            if (this.results.currentCost) {
                this.results.currentCost.textContent = Utils.formatCurrency(calculations.currentCost);
            }
            if (this.results.potentialSavings) {
                this.results.potentialSavings.textContent = Utils.formatCurrency(calculations.potentialSavings);
            }
            if (this.results.annualSavings) {
                this.results.annualSavings.textContent = Utils.formatCurrency(calculations.annualSavings);
            }
            if (this.results.roiPercentage) {
                this.results.roiPercentage.textContent = `${Math.round(calculations.roiPercentage)}%`;
            }
        }

        trackCalculatorUsage() {
            CONFIG.analytics.trackEvent('interaction', 'roi_calculator', 'input_change');
        }
    }

    // ===== PROGRESSIVE FORM =====
    class ProgressiveForm {
        constructor() {
            this.form = document.getElementById('consultation-form-element');
            this.steps = document.querySelectorAll('.form-step');
            this.currentStep = 1;
            this.totalSteps = this.steps.length;
            this.progressBar = document.querySelector('.progress-fill');
            this.progressSteps = document.querySelectorAll('.step');
            this.prevBtn = document.querySelector('.btn-prev');
            this.nextBtn = document.querySelector('.btn-next');
            this.submitBtn = document.querySelector('.btn-submit');
            this.formSuccess = document.getElementById('form-success');
            this.budgetRange = document.getElementById('budget');
            this.budgetOutput = document.querySelector('output[for="budget"]');

            // Form validation rules
            this.validationRules = {
                'first-name': { required: true, minLength: 2 },
                'last-name': { required: true, minLength: 2 },
                'email': { required: true, type: 'email' },
                'phone': { required: true, type: 'tel' },
                'company-name': { required: true, minLength: 2 },
                'job-title': { required: true, minLength: 2 },
                'company-size': { required: true },
                'industry': { required: true }
            };

            this.leadScoring = {
                email_domain: { business: 25, personal: -10 },
                company_size: { '1-10': 10, '11-50': 20, '51-200': 25, '201-1000': 30 },
                industry: { healthcare: 25, finance: 30, saas: 25, other: 15 },
                budget_range: { low: 10, medium: 20, high: 30 },
                pain_points: { multiple: 15, critical: 20 },
                engagement: { video_watched: 10, pdf_downloaded: 15, pricing_viewed: 20 }
            };

            this.init();
        }

        init() {
            if (!this.form) return;

            this.bindEvents();
            this.updateProgress();
            this.setupBudgetRange();
            this.setupRealTimeValidation();
        }

        bindEvents() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.previousStep());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextStep());
            }

            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Keyboard navigation
            this.form.addEventListener('keydown', (e) => this.handleKeydown(e));

            // Track form interactions
            this.form.addEventListener('focusin', (e) => this.trackFieldFocus(e));
        }

        setupBudgetRange() {
            if (!this.budgetRange || !this.budgetOutput) return;

            const updateBudgetDisplay = () => {
                const value = parseInt(this.budgetRange.value);
                this.budgetOutput.textContent = Utils.formatCurrency(value);
            };

            this.budgetRange.addEventListener('input', updateBudgetDisplay);
            updateBudgetDisplay(); // Initial update
        }

        setupRealTimeValidation() {
            Object.keys(this.validationRules).forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field) {
                    field.addEventListener('blur', () => this.validateField(field));
                    field.addEventListener('input', Utils.debounce(() => this.validateField(field), 300));
                }
            });

            // Special handling for email with domain suggestions
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.addEventListener('blur', () => this.handleEmailValidation(emailField));
            }
        }

        validateField(field) {
            const fieldName = field.id;
            const rules = this.validationRules[fieldName];
            const errorElement = document.getElementById(`${fieldName}-error`);

            if (!rules) return true;

            let isValid = true;
            let errorMessage = '';

            // Required field validation
            if (rules.required && !field.value.trim()) {
                isValid = false;
                errorMessage = 'This field is required';
            }

            // Minimum length validation
            if (isValid && rules.minLength && field.value.trim().length < rules.minLength) {
                isValid = false;
                errorMessage = `Minimum ${rules.minLength} characters required`;
            }

            // Email validation
            if (isValid && rules.type === 'email') {
                const emailValidation = Utils.validateBusinessEmail(field.value);
                if (!emailValidation.valid) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            }

            // Phone validation
            if (isValid && rules.type === 'tel') {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
            }

            // Update field appearance and error message
            if (errorElement) {
                if (isValid) {
                    field.classList.remove('invalid');
                    errorElement.textContent = '';
                    errorElement.classList.remove('visible');
                } else {
                    field.classList.add('invalid');
                    errorElement.textContent = errorMessage;
                    errorElement.classList.add('visible');
                }
            }

            return isValid;
        }

        handleEmailValidation(emailField) {
            const emailValidation = Utils.validateBusinessEmail(emailField.value);

            if (emailValidation.valid && emailValidation.suggestion && emailValidation.isPersonal) {
                // Show suggestion for business email
                const suggestionElement = this.createEmailSuggestion(emailValidation.suggestion);
                emailField.parentNode.appendChild(suggestionElement);
            }
        }

        createEmailSuggestion(suggestion) {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'email-suggestion';
            suggestionDiv.innerHTML = `
                <small>
                    Did you mean:
                    <button type="button" class="suggestion-btn">${suggestion}</button>?
                </small>
            `;

            suggestionDiv.querySelector('.suggestion-btn').addEventListener('click', () => {
                document.getElementById('email').value = suggestion;
                suggestionDiv.remove();
            });

            return suggestionDiv;
        }

        validateCurrentStep() {
            const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (!currentStepElement) return true;

            const fields = currentStepElement.querySelectorAll('input[required], select[required]');
            let isStepValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isStepValid = false;
                }
            });

            // Special validation for step 3 (at least one challenge should be selected)
            if (this.currentStep === 3) {
                const challenges = document.querySelectorAll('input[name="challenges"]:checked');
                if (challenges.length === 0) {
                    // Show validation message for challenges
                    isStepValid = false;
                }
            }

            return isStepValid;
        }

        nextStep() {
            if (!this.validateCurrentStep()) {
                // Focus first invalid field
                const invalidField = document.querySelector('.form-step.active input.invalid, .form-step.active select.invalid');
                if (invalidField) {
                    invalidField.focus();
                }
                return;
            }

            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateSteps();
                this.updateProgress();
                this.updateNavigation();

                // Track step progression
                CONFIG.analytics.trackEvent('form_step', 'consultation', `step_${this.currentStep}`);
            }
        }

        previousStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.updateSteps();
                this.updateProgress();
                this.updateNavigation();
            }
        }

        updateSteps() {
            this.steps.forEach((step, index) => {
                if (index + 1 === this.currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        updateProgress() {
            const progress = (this.currentStep / this.totalSteps) * 100;
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
            }

            // Update progress steps
            this.progressSteps.forEach((step, index) => {
                if (index + 1 <= this.currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        updateNavigation() {
            // Update previous button
            if (this.prevBtn) {
                this.prevBtn.disabled = this.currentStep === 1;
            }

            // Show/hide next/submit buttons
            if (this.currentStep === this.totalSteps) {
                if (this.nextBtn) this.nextBtn.style.display = 'none';
                if (this.submitBtn) this.submitBtn.style.display = 'inline-flex';
            } else {
                if (this.nextBtn) this.nextBtn.style.display = 'inline-flex';
                if (this.submitBtn) this.submitBtn.style.display = 'none';
            }
        }

        calculateLeadScore() {
            let score = 0;
            const formData = new FormData(this.form);

            // Email domain scoring
            const email = formData.get('email');
            if (email) {
                const emailValidation = Utils.validateBusinessEmail(email);
                score += emailValidation.isPersonal ?
                    this.leadScoring.email_domain.personal :
                    this.leadScoring.email_domain.business;
            }

            // Company size scoring
            const companySize = formData.get('company-size');
            if (companySize && this.leadScoring.company_size[companySize]) {
                score += this.leadScoring.company_size[companySize];
            }

            // Industry scoring
            const industry = formData.get('industry');
            if (industry && this.leadScoring.industry[industry]) {
                score += this.leadScoring.industry[industry];
            }

            // Budget range scoring
            const budget = parseInt(formData.get('budget'));
            if (budget) {
                if (budget >= 50000) score += this.leadScoring.budget_range.high;
                else if (budget >= 20000) score += this.leadScoring.budget_range.medium;
                else score += this.leadScoring.budget_range.low;
            }

            // Pain points scoring
            const challenges = formData.getAll('challenges');
            if (challenges.length >= 3) {
                score += this.leadScoring.pain_points.multiple;
            }
            if (challenges.includes('downtime') || challenges.includes('security')) {
                score += this.leadScoring.pain_points.critical;
            }

            return Math.max(0, Math.min(100, score)); // Clamp between 0-100
        }

        async handleSubmit(e) {
            e.preventDefault();

            if (!this.validateCurrentStep()) {
                return;
            }

            // Show loading state
            this.setSubmitState(true);

            try {
                const formData = new FormData(this.form);
                const leadScore = this.calculateLeadScore();

                // Add lead score to form data
                formData.append('lead_score', leadScore);
                formData.append('timestamp', new Date().toISOString());

                // Simulate API call (replace with actual endpoint)
                await this.submitToAPI(formData);

                // Show success message
                this.showSuccess();

                // Track successful submission
                CONFIG.analytics.trackEvent('form_submit', 'consultation', 'success', leadScore);

            } catch (error) {
                console.error('Form submission error:', error);
                this.showError('Something went wrong. Please try again.');

                // Track failed submission
                CONFIG.analytics.trackEvent('form_submit', 'consultation', 'error');
            } finally {
                this.setSubmitState(false);
            }
        }

        async submitToAPI(formData) {
            // Simulate API call - replace with actual implementation
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate success/failure
                    if (Math.random() > 0.1) { // 90% success rate
                        resolve({ success: true });
                    } else {
                        reject(new Error('API Error'));
                    }
                }, 2000);
            });
        }

        setSubmitState(loading) {
            if (this.submitBtn) {
                this.submitBtn.setAttribute('data-loading', loading);
                this.submitBtn.disabled = loading;

                const btnText = this.submitBtn.querySelector('.btn-text');
                const loadingText = this.submitBtn.getAttribute('data-loading-text');

                if (loading && loadingText && btnText) {
                    btnText.textContent = loadingText;
                } else if (btnText) {
                    btnText.textContent = 'Book My Free Strategy Session';
                }
            }
        }

        showSuccess() {
            this.form.style.display = 'none';
            if (this.formSuccess) {
                this.formSuccess.style.display = 'block';
            }
        }

        showError(message) {
            // Create or update error message
            let errorDiv = document.querySelector('.form-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'form-error';
                this.form.parentNode.insertBefore(errorDiv, this.form);
            }

            errorDiv.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }

        handleKeydown(e) {
            // Handle keyboard navigation
            if (e.key === 'Enter' && e.target.type !== 'textarea') {
                e.preventDefault();
                if (this.currentStep < this.totalSteps) {
                    this.nextStep();
                } else {
                    this.handleSubmit(e);
                }
            }
        }

        trackFieldFocus(e) {
            const fieldName = e.target.id || e.target.name;
            if (fieldName) {
                CONFIG.analytics.trackEvent('form_interaction', 'field_focus', fieldName);
            }
        }
    }

    // ===== SCROLL ANIMATIONS =====
    class ScrollAnimations {
        constructor() {
            this.animatedElements = document.querySelectorAll('.service-card, .section-header, .calculator-container');
            this.init();
        }

        init() {
            this.setupScrollAnimations();
        }

        setupScrollAnimations() {
            if (!window.IntersectionObserver) return;

            const observer = Utils.createObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Staggered animation delay
                        setTimeout(() => {
                            entry.target.classList.add('fade-in');
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            });

            this.animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }

    // ===== EXIT INTENT & RETENTION =====
    class ExitIntentHandler {
        constructor() {
            this.hasShownExitIntent = false;
            this.scrollEngagement = 0;
            this.timeOnPage = Date.now();
            this.init();
        }

        init() {
            this.setupExitIntent();
            this.trackScrollEngagement();
        }

        setupExitIntent() {
            let exitIntentTriggered = false;

            document.addEventListener('mouseleave', (e) => {
                if (e.clientY <= 0 && !exitIntentTriggered && !this.hasShownExitIntent) {
                    this.showExitIntentModal();
                    exitIntentTriggered = true;
                    this.hasShownExitIntent = true;
                }
            });

            // Mobile exit intent (back button simulation)
            let touchStartY = 0;
            document.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });

            document.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const touchDiff = touchY - touchStartY;

                if (touchDiff > 50 && window.scrollY <= 0 && !this.hasShownExitIntent) {
                    this.showExitIntentModal();
                    this.hasShownExitIntent = true;
                }
            });
        }

        trackScrollEngagement() {
            window.addEventListener('scroll', Utils.throttle(() => {
                const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                this.scrollEngagement = Math.max(this.scrollEngagement, scrollPercent);

                // Track significant scroll milestones
                if (scrollPercent >= 25 && !this.scrollMilestones?.['25']) {
                    CONFIG.analytics.trackEvent('scroll_depth', 'engagement', '25_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, '25': true };
                }
                if (scrollPercent >= 50 && !this.scrollMilestones?.['50']) {
                    CONFIG.analytics.trackEvent('scroll_depth', 'engagement', '50_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, '50': true };
                }
                if (scrollPercent >= 75 && !this.scrollMilestones?.['75']) {
                    CONFIG.analytics.trackEvent('scroll_depth', 'engagement', '75_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, '75': true };
                }
            }, 250));
        }

        showExitIntentModal() {
            // Create exit intent modal
            const modal = this.createExitIntentModal();
            document.body.appendChild(modal);

            // Show modal with animation
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });

            // Track exit intent
            CONFIG.analytics.trackEvent('exit_intent', 'retention', 'modal_shown');
        }

        createExitIntentModal() {
            const modal = document.createElement('div');
            modal.className = 'exit-intent-modal';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                    <h3>Wait! Don't miss your free IT consultation</h3>
                    <p>Get a personalized IT strategy session worth ₹5,000 - absolutely free.</p>
                    <div class="modal-benefits">
                        <div class="benefit">✓ Identify cost-saving opportunities</div>
                        <div class="benefit">✓ Security assessment & recommendations</div>
                        <div class="benefit">✓ Technology roadmap planning</div>
                    </div>
                    <div class="modal-cta">
                        <a href="#consultation-form" class="btn btn-primary">Claim Free Consultation</a>
                        <button class="btn btn-secondary modal-dismiss">No Thanks</button>
                    </div>
                </div>
            `;

            // Add event listeners
            modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
            modal.querySelector('.modal-dismiss').addEventListener('click', () => this.closeModal(modal));
            modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal(modal));
            modal.querySelector('.btn-primary').addEventListener('click', () => {
                this.closeModal(modal);
                CONFIG.analytics.trackEvent('exit_intent', 'conversion', 'cta_clicked');
            });

            return modal;
        }

        closeModal(modal) {
            modal.classList.add('hide');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    // ===== PERFORMANCE MONITORING =====
    class PerformanceMonitor {
        constructor() {
            this.metrics = {};
            this.init();
        }

        init() {
            this.measurePageLoad();
            this.measureCoreWebVitals();
        }

        measurePageLoad() {
            window.addEventListener('load', () => {
                if ('performance' in window) {
                    const perfData = performance.getEntriesByType('navigation')[0];

                    this.metrics.pageLoad = {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        fullLoad: perfData.loadEventEnd - perfData.loadEventStart,
                        firstByte: perfData.responseStart - perfData.requestStart
                    };

                    // Track performance metrics
                    CONFIG.analytics.trackEvent('performance', 'page_load', 'dom_content_loaded', this.metrics.pageLoad.domContentLoaded);
                }
            });
        }

        measureCoreWebVitals() {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                CONFIG.analytics.trackEvent('performance', 'core_web_vitals', 'lcp', Math.round(lastEntry.startTime));
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    CONFIG.analytics.trackEvent('performance', 'core_web_vitals', 'fid', Math.round(this.metrics.fid));
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = clsValue;
                CONFIG.analytics.trackEvent('performance', 'core_web_vitals', 'cls', Math.round(clsValue * 1000));
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }

    // ===== APPLICATION INITIALIZATION =====
    class App {
        constructor() {
            this.components = [];
            this.init();
        }

        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        }

        initializeComponents() {
            try {
                // Initialize all components
                this.components.push(new Navigation());
                this.components.push(new HeroAnimations());
                this.components.push(new ROICalculator());
                this.components.push(new ProgressiveForm());
                this.components.push(new ScrollAnimations());
                this.components.push(new ExitIntentHandler());
                this.components.push(new PerformanceMonitor());

                // Log successful initialization
                console.log('Geniusglider app initialized successfully');

                // Track app initialization
                CONFIG.analytics.trackEvent('app', 'initialized', 'success');

            } catch (error) {
                console.error('Error initializing app:', error);
                CONFIG.analytics.trackEvent('app', 'initialized', 'error');
            }
        }

        // Global error handler
        handleError(error, context = 'unknown') {
            console.error(`Error in ${context}:`, error);
            CONFIG.analytics.trackEvent('error', context, error.message);
        }
    }

    // ===== INITIALIZE APPLICATION =====
    const app = new App();

    // Global error handling
    window.addEventListener('error', (e) => {
        app.handleError(e.error, 'global');
    });

    window.addEventListener('unhandledrejection', (e) => {
        app.handleError(e.reason, 'promise');
    });

    // Expose utilities for debugging
    if (process?.env?.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        window.GeniusgliderApp = {
            app,
            utils: Utils,
            config: CONFIG
        };
    }

})();