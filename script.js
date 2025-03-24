let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

// Функции для переключения тарифов
function showCard(index) {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    cards.forEach((card, i) => {
        if (i >= index && i < index + cardsToShow) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function nextCard() {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    if (currentIndex + cardsToShow < cards.length) {
        currentIndex += 1;
        showCard(currentIndex);
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex -= 1;
        showCard(currentIndex);
    }
}

function selectTariff(tariff, discount, description) {
    document.getElementById("tariff").value = `${tariff} - ${discount} (${description})`;

    if (window.innerWidth <= 768) {
        const formSection = document.getElementById("application-form");
        formSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Проверка доступности GAS
async function checkGASAccess() {
    try {
        const testResponse = await fetch('https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec?ping=1', {
            method: 'GET',
            mode: 'no-cors'
        });
        console.log('GAS доступен для запросов');
    } catch (error) {
        console.warn('Проблема с доступом к GAS:', error);
    }
}

// Функция отправки формы
async function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById("phone");
    
    // Валидация телефона
    if (!/^[\d\+]{10,15}$/.test(phoneInput.value)) {
        alert('Пожалуйста, введите корректный номер телефона (минимум 10 цифр)');
        phoneInput.focus();
        return false;
    }

    // Блокируем кнопку отправки
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    try {
        // 1. Пытаемся отправить через Telegram
        const telegramMessage = `📌 Новая заявка Ростелеком\n\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`;
        
        const telegramResponse = await fetch(`https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: "968338148",
                text: telegramMessage
            })
        });

        if (telegramResponse.ok) {
            showSuccess();
        } else {
            throw new Error('Telegram API error');
        }
    } catch (error) {
        console.error("Ошибка Telegram:", error);
        
        // 2. Если Telegram не сработал - пробуем GAS
        try {
            const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
            const gasResponse = await fetch(GAS_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(formData).toString(),
                mode: "no-cors"
            });

            if (gasResponse.ok || gasResponse.status === 0) {
                showSuccess();
            } else {
                throw new Error('GAS error');
            }
        } catch (gasError) {
            console.error("Ошибка GAS:", gasError);
            showError();
        }
    }

    function showSuccess() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.display = 'none';
                resetForm();
            }, 5000);
        }
    }

    function showError() {
        alert("Произошла ошибка при отправке. Пожалуйста, позвоните нам напрямую по номеру +7 (991) 424-23-37");
        resetForm();
    }

    function resetForm() {
        // Очищаем форму, кроме тарифа
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        
        // Восстанавливаем кнопку
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подключить';
        }
    }
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подключить';
    }
});

// Инициализация
showCard(currentIndex);
checkGASAccess();
