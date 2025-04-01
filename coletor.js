(function() {
    'use strict';

    // Função para formatar o tempo restante
    function formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Função para criar o campo de entrada, botão e o timer
    function createUIElements() {
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.placeholder = 'Intervalo em minutos';
        inputField.style.width = '150px';
        inputField.style.marginRight = '10px';
        inputField.id = 'intervalInput';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar e Executar';
        saveButton.onclick = function() {
            const intervalMinutes = parseInt(inputField.value);
            if (!isNaN(intervalMinutes)) {
                localStorage.setItem('intervalMinutes', intervalMinutes);
                localStorage.setItem('nextExecution', Date.now() + intervalMinutes * 60 * 1000);
                location.reload();
            } else {
                alert('Por favor, insira um valor numérico válido.');
            }
        };

        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timerDisplay';
        timerDisplay.style.textAlign = 'center'; // Centraliza o timer

        const container = document.createElement('div');
        container.id = 'timerContainer'; // Adiciona um ID ao container
        container.style.width = '100%'; // Faz o container ocupar a largura total da coluna
        container.appendChild(inputField);
        container.appendChild(saveButton);
        container.appendChild(timerDisplay);

        // Encontra o elemento <th>Recrutamento</th> e insere o container antes dele
        const thRecrutamento = document.evaluate("//th[contains(., 'Recrutamento')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (thRecrutamento) {
            const parent = thRecrutamento.parentNode;
            parent.insertBefore(container, thRecrutamento);
        } else {
            console.error("Elemento <th>Recrutamento</th> não encontrado.");
        }

        return timerDisplay;
    }

    // Função para fechar a janela de alerta / clicar no OK
    function closeAlert() {
        const alertBox = document.querySelector('.popup_box'); // Tenta encontrar a janela de alerta
        if (alertBox && alertBox.textContent.includes('Recursos enviados com sucesso')) {
            const okButton = alertBox.querySelector('.btn.btn-default'); // Encontra o botão OK
            if (okButton) {
                okButton.click();
            }
        }
    }

    // Observa mudanças na janela de alerta
    const alertObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                closeAlert();
            }
        });
    });

    // Configura o observer para observar a raiz do documento e seus filhos
    alertObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Função para executar o script
    function runScript() {
        // Clica no link do balanceador
        const balancerLink = document.querySelector('.quickbar_link[data-hash="8e86021609dd9b4fada959885bf76bc1"]');
        if (balancerLink) {
            balancerLink.click();
        }

        // Função para clicar nos botões
        function clickResourceButtons() {
            const buttons = document.querySelectorAll('input[type="button"].btn.btnSophie[value="Enviar recursos"]');
            if (buttons.length > 0) {
                let i = 0;
                const intervalId = setInterval(function() {
                    if (i < buttons.length) {
                        buttons[i].click();
                        i++;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 150);
            }
        }

        // Observa mudanças no DOM após o clique no balanceador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Verifica se novos nós foram adicionados
                if (mutation.addedNodes.length) {
                    clickResourceButtons();
                }
            });
        });

        // Configura o observer para observar a raiz do documento e seus filhos
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

       // Não agenda a próxima execução aqui, será feito apenas quando o timer zerar
    }

    window.addEventListener('load', function() {
        const nextExecution = localStorage.getItem('nextExecution');
        const intervalMinutes = parseInt(localStorage.getItem('intervalMinutes'));
        const timerDisplay = createUIElements();

        function updateTimerDisplay() {
            const nextExecution = localStorage.getItem('nextExecution');
            if (nextExecution) {
                const timeRemaining = parseInt(nextExecution) - Date.now();
                if (timeRemaining <= 0) {
                    timerDisplay.textContent = 'Executando...';
                    runScript(); // Executa o script quando o tempo zerar

                    // Agenda a próxima execução e recarrega a página
                    const intervalMinutes = parseInt(localStorage.getItem('intervalMinutes'));
                    if (intervalMinutes) {
                        const nextExecution = Date.now() + intervalMinutes * 60 * 1000;
                        localStorage.setItem('nextExecution', nextExecution);
                         setTimeout(() => {
                            location.reload();
                        }, 25000); // Atualiza a página após 25 segundos
                     }

                } else {
                    timerDisplay.textContent = `Próxima execução em: ${formatTime(timeRemaining)}`;
                }
            }
        }

        // Verifica se é a primeira vez que a página é carregada
        if (!localStorage.getItem('firstLoad')) {
            // Marca que a página já foi carregada
            localStorage.setItem('firstLoad', 'true');
            console.log("Primeira vez que a página é carregada, não executando o script.");
        } else {
             // Se não for a primeira vez, atualiza o timer normalmente
             if (nextExecution && Date.now() < parseInt(nextExecution)) {
                 // Ainda não é hora de executar
                const timeRemaining = parseInt(nextExecution) - Date.now();
                console.log(`Script será executado novamente em ${Math.ceil(timeRemaining / 1000 / 60)} minutos.`);
              }

        }

        // Atualizar o timer a cada segundo
        setInterval(updateTimerDisplay, 1000);
        updateTimerDisplay();
    });
})();
