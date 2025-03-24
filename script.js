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
        if (formSection) {
            formSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
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

// Улучшенная функция отправки формы
async function submitForm(event) {
    event.preventDefault();
    
    // Сохраняем данные формы
    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';

    let submissionSuccess = false;

    try {
        // Основная отправка через GAS
        const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
        const gasPromise = fetch(GAS_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json" 
            },
            body: JSON.stringify(formData),
            mode: "cors"
        });

        // Резервная отправка в Telegram
        const telegramUrl = `https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${
            encodeURIComponent(`📌 Заявка\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`)
        }`;

        // Пытаемся отправить через GAS с таймаутом 3 секунды
        const gasResponse = await Promise.race([
            gasPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

        if (gasResponse && gasResponse.ok) {
            submissionSuccess = true;
        } else {
            // Если GAS не ответил, пробуем Telegram
            await fetch(telegramUrl);
            submissionSuccess = true;
        }
    } catch (error) {
        // Последняя попытка - только Telegram
        try {
            await fetch(`https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${
                encodeURIComponent(`❗Резервная заявка\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`)
            }`);
            submissionSuccess = true;
        } catch (e) {
            console.error("Все способы отправки не сработали:", e);
            // Только если ВСЕ способы провалились - показываем ошибку
            if (!submissionSuccess) {
                alert("Произошла ошибка. Пожалуйста, позвоните нам напрямую или попробуйте позже.");
            }
        }
    } finally {
        // Скрываем loader
        if (loader) loader.style.display = 'none';
        
        // Очищаем форму только при успешной отправке
        if (submissionSuccess) {
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 3000);
            }
            
            document.getElementById("address").value = "";
            document.getElementById("name").value = "";
            document.getElementById("phone").value = "";
        }
    }
}

// Закрытие модального окна
const closeButton = document.querySelector('.close');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        const modal = document.getElementById('successModal');
        if (modal) modal.style.display = 'none';
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    showCard(currentIndex);
    checkGASAccess();
    
    // Назначение обработчика формы
    const form = document.getElementById('application-form');
    if (form) {
        form.addEventListener('submit', submitForm);
    }
});

