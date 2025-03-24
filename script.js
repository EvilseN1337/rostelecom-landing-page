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

// Проверка доступности GAS (CORS preflight)
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

// Улучшенная функция отправки формы с полной обработкой
async function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    // Показываем loader
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';

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
        const telegramBackup = () => fetch(
            `https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${
                encodeURIComponent(`❗Резервная заявка!\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`)
            }`
        );

        // Ожидаем ответ с таймаутом
        const response = await Promise.race([
            gasPromise.then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        // Успешная обработка
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.display = 'none', 3000);
        }

    } catch (error) {
        console.error("Ошибка при отправке:", error);
        // Выполняем резервную отправку
        await telegramBackup().catch(e => console.error('Ошибка резервной отправки:', e));
    } finally {
        // Очистка формы
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        
        // Скрываем loader
        if (loader) loader.style.display = 'none';
    }
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
});

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
