let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

// Функции для переключения тарифов (без изменений)
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

// Проверка доступности GAS (без изменений)
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

// ИСПРАВЛЕННАЯ функция отправки формы (без дублирования в Telegram)
async function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';

    let sendSuccess = false;
    let telegramSent = false; // Флаг для контроля однократной отправки в Telegram

    try {
        // 1. Пытаемся отправить через GAS (основной способ)
        const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
        const gasResponse = await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
            mode: "cors"
        });

        if (gasResponse.ok) {
            sendSuccess = true;
        }
    } catch (error) {
        console.log("Ошибка GAS, пробуем Telegram");
    }

    // 2. Если GAS не сработал и Telegram еще не отправлялся
    if (!sendSuccess && !telegramSent) {
        try {
            await fetch(`https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${
                encodeURIComponent(`📌 Заявка\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`)
            }`);
            sendSuccess = true;
            telegramSent = true; // Помечаем, что Telegram уже отправлен
        } catch (error) {
            console.error("Ошибка Telegram:", error);
        }
    }

    // 3. Всегда скрываем loader
    if (loader) loader.style.display = 'none';

    // 4. Обработка результата
    if (sendSuccess) {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.display = 'none', 3000);
        }
        
        // Очищаем форму
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
    } else {
        alert("Произошла ошибка. Пожалуйста, позвоните нам напрямую.");
    }
}

// Закрытие модального окна (без изменений)
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Инициализация (без изменений)
showCard(currentIndex);
checkGASAccess();

