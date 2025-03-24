let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

// Функции для переключения тарифов (остаются без изменений)
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

// ОБНОВЛЕННАЯ Функция отправки формы
async function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        tariff: document.getElementById("tariff").value,
        address: document.getElementById("address").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    try {
        // Ваш URL из Google Apps Script
        const GAS_URL = "https://script.google.com/macros/s/AKfycbzzInTg3LnQAdYIendesGlqn8rT4RPdXW_DARa1fqunWSG-twudL8PUJTfX-FBhrYOP/exec";
        
        const response = await fetch(GAS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        // Показываем уведомление об успехе
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);

        // Очищаем форму (опционально)
        document.getElementById("address").value = "";
        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";

    } catch (error) {
        console.error("Ошибка при отправке:", error);
        alert("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Инициализация
showCard(currentIndex);
