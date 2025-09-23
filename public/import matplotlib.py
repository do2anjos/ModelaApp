import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

# --- Dados do Experimento com o Prisma (letra e) ---
# Seus dados de incidência (i) e refração (r) em graus
graus_i = np.array([0, 10, 15, 20, 25, 30, 35, 40, 45])
graus_r = np.array([0, 14, 22, 29.5, 38, 47.5, 58, 72.5, 86.5])

# Converter graus para radianos para usar a função seno do numpy
rad_i = np.deg2rad(graus_i)
rad_r = np.deg2rad(graus_r)

# Calcular o seno de cada ângulo
seno_i = np.sin(rad_i)
seno_r = np.sin(rad_r)

# Para a regressão, o eixo x é Seno(i) e o eixo y é Seno(r)
# O scikit-learn espera um formato de array 2D para a variável X
x_data = seno_i.reshape(-1, 1)
y_data = seno_r

# --- Cálculo da Regressão Linear ---
model = LinearRegression()
model.fit(x_data, y_data)

# Fazer as previsões para desenhar a linha
y_pred = model.predict(x_data)

# Obter os parâmetros da reta: y = b*x + a
# 'b' é o coeficiente angular (índice de refração do prisma, n_prisma)
# 'a' é o intercepto (deve ser próximo de zero)
coef_angular_n_prisma = model.coef_[0]
intercepto_a = model.intercept_
r2 = r2_score(y_data, y_pred)


# --- Criação do Gráfico ---
plt.figure(figsize=(10, 7))

# Plota os pontos experimentais
plt.scatter(seno_i, seno_r, color='green', label='Dados Experimentais', s=50, zorder=5)

# Plota a linha de regressão
plt.plot(seno_i, y_pred, color='purple', linewidth=2, label='Regressão Linear')

# Adiciona títulos e rótulos
plt.title('Gráfico de Seno(r) vs. Seno(i) - Experimento com Prisma', fontsize=16)
plt.xlabel('Seno do Ângulo de Incidência - Seno(i)', fontsize=12)
plt.ylabel('Seno do Ângulo de Refração - Seno(r)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend(fontsize=12)

# Coloca a equação da reta e o R² no gráfico
# A anotação destaca que o coeficiente angular é o índice de refração do prisma
equation_text = (f'Índice de Refração do Prisma (n) = {coef_angular_n_prisma:.2f}\n'
                 f'Equação: y = {coef_angular_n_prisma:.2f}x + ({intercepto_a:.3f})\n'
                 f'$R^2$ = {r2:.3f}')
plt.text(0.05, 0.8, equation_text, fontsize=12, bbox=dict(facecolor='white', alpha=0.8))

# Ajusta os limites para o gráfico começar do zero
plt.xlim(left=0)
plt.ylim(bottom=0)
plt.tight_layout()

# Salva o gráfico em um arquivo
plt.savefig('grafico_experimento_f_prisma.png')

# Mostra o gráfico
plt.show()