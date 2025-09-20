// Simple JavaScript for Geniusglider website
(function() {
    'use strict';

    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        try {
            initNavigation();
            initAnimatedNumbers();
            initROICalculator();
            initCaseStudyFilters();
            console.log('Geniusglider app initialized');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Navigation functionality
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                const isOpen = navMenu.classList.contains('active');

                if (isOpen) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                } else {
                    navMenu.classList.add('active');
                    navToggle.setAttribute('aria-expanded', 'true');
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // Animated numbers
    function initAnimatedNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');

        if (statNumbers.length === 0) return;

        // Intersection Observer for animation trigger
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                    animateNumber(entry.target);
                    entry.target.setAttribute('data-animated', 'true');
                }
            });
        }, {
            threshold: 0.5
        });

        statNumbers.forEach(function(stat) {
            observer.observe(stat);
        });
    }

    function animateNumber(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        const prefix = element.getAttribute('data-prefix') || '';
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000;
        const startTime = Date.now();
        const startValue = 0;

        if (isNaN(target)) {
            element.textContent = element.getAttribute('data-target') || '0';
            return;
        }

        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (target - startValue) * eased;

            // Format the number appropriately
            let formattedNumber;
            if (target % 1 === 0) {
                // Integer
                formattedNumber = Math.round(current);
            } else {
                // Decimal
                formattedNumber = current.toFixed(1);
            }

            // Combine prefix, number, and suffix
            element.textContent = prefix + formattedNumber + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exactly target
                let finalNumber;
                if (target % 1 === 0) {
                    finalNumber = target;
                } else {
                    finalNumber = target.toFixed(1);
                }
                element.textContent = prefix + finalNumber + suffix;
            }
        }

        update();
    }

    // ROI Calculator (Case Studies page)
    function initROICalculator() {
        const calculateBtn = document.querySelector('button[onclick="calculateROI()"]');

        if (calculateBtn) {
            // Remove inline onclick and add proper event listener
            calculateBtn.removeAttribute('onclick');
            calculateBtn.addEventListener('click', calculateROI);
        }
    }

    // Advanced ROI calculation function
    function calculateAdvancedROI() {
        const currentBudget = parseFloat(document.getElementById('current-budget')?.value) || 0;
        const employees = parseFloat(document.getElementById('employees')?.value) || 0;
        const issues = parseFloat(document.getElementById('downtime')?.value) || 0;
        const hourlyCost = parseFloat(document.getElementById('avg-hourly-cost')?.value) || 500;

        // Validation
        if (currentBudget === 0) {
            alert('Please enter your current IT budget');
            return;
        }
        if (employees === 0) {
            alert('Please select your company size');
            return;
        }
        if (issues === 0) {
            alert('Please select IT issue frequency');
            return;
        }

        // Calculate current productivity loss
        const avgIssueResolutionTime = 4; // hours per issue
        const monthlyDowntimeHours = issues * avgIssueResolutionTime;
        const affectedEmployeesPerIssue = Math.min(employees * 0.3, 20); // 30% of staff affected, max 20
        const monthlyProductivityLoss = monthlyDowntimeHours * affectedEmployeesPerIssue * hourlyCost;

        // Calculate our service pricing based on company size
        let serviceCost = 0;
        if (employees <= 10) {
            serviceCost = 15000; // ₹15,000 for small businesses
        } else if (employees <= 25) {
            serviceCost = 25000; // ₹25,000 for small-medium
        } else if (employees <= 50) {
            serviceCost = 40000; // ₹40,000 for medium
        } else if (employees <= 100) {
            serviceCost = 65000; // ₹65,000 for medium-large
        } else if (employees <= 250) {
            serviceCost = 120000; // ₹1.2L for large
        } else if (employees <= 500) {
            serviceCost = 200000; // ₹2L for enterprise
        } else {
            serviceCost = 350000; // ₹3.5L for large enterprise
        }

        // Calculate potential improvements with our service (conservative estimates)
        const downtimeReduction = 0.40; // Up to 40% reduction in issues
        const resolutionSpeedImprovement = 0.50; // Up to 50% faster resolution
        const infrastructureSavings = currentBudget * 0.15; // Up to 15% cost optimization

        // New productivity loss after our service
        const newIssues = issues * (1 - downtimeReduction);
        const newResolutionTime = avgIssueResolutionTime * (1 - resolutionSpeedImprovement);
        const newMonthlyDowntime = newIssues * newResolutionTime;
        const newProductivityLoss = newMonthlyDowntime * affectedEmployeesPerIssue * hourlyCost;

        // Calculate savings
        const productivitySavings = monthlyProductivityLoss - newProductivityLoss;
        const totalMonthlySavings = productivitySavings + infrastructureSavings - serviceCost;
        const annualROI = totalMonthlySavings * 12;
        const roiPercentage = ((annualROI / (serviceCost * 12)) * 100);

        // Format currency for Indian Rupees
        function formatCurrency(amount) {
            return '₹' + Math.round(amount).toLocaleString('en-IN');
        }

        // Display results
        const productivityLossEl = document.getElementById('productivity-loss');
        const serviceCostEl = document.getElementById('service-cost');
        const monthlySavingsEl = document.getElementById('monthly-savings');
        const annualROIEl = document.getElementById('annual-roi');
        const roiPercentageEl = document.getElementById('roi-percentage');
        const resultsEl = document.getElementById('roi-results');

        if (productivityLossEl) productivityLossEl.textContent = formatCurrency(monthlyProductivityLoss);
        if (serviceCostEl) serviceCostEl.textContent = formatCurrency(serviceCost);
        if (monthlySavingsEl) {
            monthlySavingsEl.textContent = formatCurrency(Math.max(0, totalMonthlySavings));
            monthlySavingsEl.style.color = totalMonthlySavings > 0 ? '#059669' : '#DC2626';
        }
        if (annualROIEl) {
            annualROIEl.textContent = formatCurrency(Math.max(0, annualROI));
            annualROIEl.style.color = annualROI > 0 ? '#059669' : '#DC2626';
        }
        if (roiPercentageEl) {
            roiPercentageEl.textContent = Math.round(Math.max(0, roiPercentage)) + '%';
            roiPercentageEl.style.color = roiPercentage > 0 ? '#059669' : '#DC2626';
        }
        if (resultsEl) resultsEl.style.display = 'block';
    }

    // Legacy ROI calculation function for backward compatibility
    function calculateROI() {
        return calculateAdvancedROI();
    }

    // Case study filters
    function initCaseStudyFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const caseStudyCards = document.querySelectorAll('.case-study-card');

        if (filterButtons.length === 0) return;

        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const filter = button.getAttribute('data-filter');

                // Update active button
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                // Filter case studies
                caseStudyCards.forEach(function(card) {
                    if (filter === 'all' || card.getAttribute('data-industry') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // FAQ functionality
    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(function(question) {
            question.addEventListener('click', function() {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';

                // Close all other FAQs
                faqQuestions.forEach(function(otherQuestion) {
                    if (otherQuestion !== question) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current FAQ
                question.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Enhanced form validation
    function initFormValidation() {
        const form = document.getElementById('consultation-form-element');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(input);
            });

            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldGroup = field.closest('.field-group');

        // Remove existing error
        clearFieldError(field);

        if (!value && field.hasAttribute('required')) {
            showFieldError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        return true;
    }

    function showFieldError(field, message) {
        const fieldGroup = field.closest('.field-group');
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.color = '#DC2626';
        errorEl.style.fontSize = '0.875rem';
        errorEl.style.marginTop = '0.25rem';
        errorEl.style.display = 'block';

        field.style.borderColor = '#DC2626';
        fieldGroup.appendChild(errorEl);
    }

    function clearFieldError(field) {
        const fieldGroup = field.closest('.field-group');
        const existingError = fieldGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }

    // Initialize all new functionality
    function initializeContactPage() {
        initFAQ();
        initSmoothScrolling();
        initFormValidation();
    }

    // Add contact page initialization to the main init
    const originalInit = initializeApp;
    function initializeApp() {
        originalInit();
        initializeContactPage();
    }

    // Make calculateROI available globally for any remaining inline calls
    window.calculateROI = calculateROI;
    window.calculateAdvancedROI = calculateAdvancedROI;

})();