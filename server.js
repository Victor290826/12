const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do servidor
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve os arquivos do site (index.html, imagens, etc.)

// Banco de dados em memória (listas temporárias)
let listaDePedidos = [];
let listaDeReservas = [];
let contadorPedidos = 1000;
let contadorReservas = 5000;

// ==========================================
// ROTAS DE PEDIDOS (DELIVERY)
// ==========================================

// 1. Receber um Novo Pedido enviado pelo site
app.post('/api/pedidos', (req, res) => {
    const { endereco, itens, pagamento, total } = req.body;

    // Validação básica de entrada
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "O carrinho está vazio!" });
    }

    if (!endereco || !endereco.rua || !endereco.numero || !endereco.bairro) {
        return res.status(400).json({ sucesso: false, mensagem: "Endereço incompleto!" });
    }

    contadorPedidos++;
    const novoPedido = {
        id: contadorPedidos,
        dataHora: new Date().toLocaleString('pt-BR'),
        endereco,
        itens,
        pagamento: pagamento || { forma: "Não informada", troco: null },
        total: Number(total) || 0,
        status: "Pendente"
    };

    listaDePedidos.push(novoPedido);

    // Formata a lista de itens e troco para o terminal
    const resumoItens = itens.map(item => `   • ${item.nome} (R$ ${Number(item.preco).toFixed(2)})`).join('\n');
    const infoTroco = pagamento && pagamento.troco ? ` (Troco para R$ ${pagamento.troco})` : '';
    const infoComplemento = endereco.complemento ? ` (${endereco.complemento})` : '';

    // Logs no terminal / Render
    console.log("\n==========================================");
    console.log(`🍔 NOVO PEDIDO RECEBIDO! ID: #${novoPedido.id}`);
    console.log(`⏰ Data/Hora: ${novoPedido.dataHora}`);
    console.log(`📍 Endereço: ${endereco.rua}, Nº ${endereco.numero} - ${endereco.bairro}${infoComplemento}`);
    console.log(`🛒 ITENS DO PEDIDO:\n${resumoItens}`);
    console.log(`💳 Pagamento: ${novoPedido.pagamento.forma}${infoTroco}`);
    console.log(`💵 Total: R$ ${novoPedido.total.toFixed(2)}`);
    console.log("==========================================\n");

    res.status(201).json({
        sucesso: true,
        mensagem: "Pedido recebido com sucesso!",
        pedido: novoPedido
    });
});

// 2. Consultar Histórico de Pedidos
app.get('/api/pedidos', (req, res) => {
    res.json(listaDePedidos);
});

// ==========================================
// ROTAS DE RESERVAS
// ==========================================

// 3. Receber uma Nova Reserva
app.post('/api/reservas', (req, res) => {
    const { dia, mes, ano, hora, minuto, pessoas } = req.body;

    if (!dia || !mes || !ano || !hora || !minuto) {
        return res.status(400).json({ sucesso: false, mensagem: "Dados de data e horário incompletos!" });
    }

    contadorReservas++;
    const novaReserva = {
        id: contadorReservas,
        dataReserva: `${dia}/${mes}/${ano}`,
        horario: `${hora}:${minuto}`,
        pessoas: pessoas || "1 Pessoa",
        dataCriacao: new Date().toLocaleString('pt-BR')
    };

    listaDeReservas.push(novaReserva);

    console.log("\n==========================================");
    console.log(`📅 NOVA RESERVA CONFIRMADA! ID: #${novaReserva.id}`);
    console.log(`🗓️ Data: ${novaReserva.dataReserva} às ${novaReserva.horario}`);
    console.log(`👥 Nº de Pessoas: ${novaReserva.pessoas}`);
    console.log("==========================================\n");

    res.status(201).json({
        sucesso: true,
        mensagem: "Reserva realizada com sucesso!",
        reserva: novaReserva
    });
});

// 4. Consultar Histórico de Reservas
app.get('/api/reservas', (req, res) => {
    res.json(listaDeReservas);
});

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});