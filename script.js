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

// ОБНОВЛЕННАЯ Функция отправки формы с полной обработкой CORS
async function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    // Ваш новый URL GAS
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
    
    // Показываем loader (добавьте элемент с id="loader" в HTML)
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';

    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData),
            mode: "cors"
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        
        // Показываем уведомление об успехе
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);

        // Очищаем форму
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";

    } catch (error) {
        console.error("Ошибка при отправке:", error);
        alert("Произошла ошибка. Пожалуйста, попробуйте позже или свяжитесь с нами через Telegram.");
        
        // Дублируем заявку в Telegram через резервный метод
        const backupUrl = `https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${encodeURIComponent(
            `❗Резервная заявка!\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`
        )}`;
        fetch(backupUrl).catch(e => console.error('Ошибка резервной отправки:', e));
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Инициализация
showCard(currentIndex);
checkGASAccess(); // Проверяем доступность GAS при загрузке страницы
