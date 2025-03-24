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

// ФИНАЛЬНАЯ исправленная функция отправки формы
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

    // Создаем уникальный идентификатор для этой отправки
    const submissionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('lastSubmissionId', submissionId);

    try {
        // 1. Сначала пробуем отправить через GAS
        const GAS_URL = "https://script.google.com/macros/s/AKfycbxVXWpL5p0Bt9-pEzcTUcnybKa1eKzcLMfSK_te4zFV3UhY-krE0G0-XO_4g9s1IENybw/exec";
        const gasResponse = await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
            mode: "cors"
        });

        if (!gasResponse.ok) throw new Error('GAS response not OK');

        // Если GAS сработал - просто завершаем
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.style.display = 'none', 3000);
        }
        
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        
    } catch (error) {
        console.log("Ошибка GAS, пробуем Telegram (однократно)");
        
        // 2. Проверяем, не отправляли ли мы уже это в Telegram
        const lastId = localStorage.getItem('lastSubmissionId');
        if (lastId === submissionId) {
            try {
                await fetch(`https://api.telegram.org/bot7628185270:AAEeK69bRl6iKxlQIApVRcV9RUsutuNSMAA/sendMessage?chat_id=968338148&text=${
                    encodeURIComponent(`📌 Заявка\nТариф: ${formData.tariff}\nАдрес: ${formData.address}\nИмя: ${formData.name}\nТелефон: ${formData.phone}`)
                }`);
                
                const modal = document.getElementById('successModal');
                if (modal) {
                    modal.style.display = 'flex';
                    setTimeout(() => modal.style.display = 'none', 3000);
                }
                
                document.getElementById("address").value = "";
                document.getElementById("name").value = "";
                document.getElementById("phone").value = "";
            } catch (e) {
                console.error("Ошибка Telegram:", e);
                alert("Произошла ошибка. Пожалуйста, позвоните нам напрямую.");
            }
        }
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// Закрытие модального окна (без изменений)
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Инициализация (без изменений)
showCard(currentIndex);
checkGASAccess();

