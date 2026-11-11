const express = require('express');
const app = express();

app.use(express.json());

let pessoas = [
  {
    id: 1,
    nome: 'Maria Souza',
    cpf: '123.456.789-00',
    dataNascimento: '1990-05-10'
  }
];

let passaportes = [
  {
    id: 1,
    numero: 'AB123456',
    dataEmissao: '2024-01-15',
    dataValidade: '2034-01-15',
    idPessoa: 1
  }
];

let proximoIdPessoa = 2;
let proximoIdPassaporte = 2;

app.get('/', (req, res) => {
  res.send('API de Pessoa e Passaporte funcionando!');
});

app.post('/pessoas', (req, res) => {
  const { nome, cpf, dataNascimento } = req.body;

  if (!nome || !cpf || !dataNascimento) {
    return res.status(400).json({
      erro: 'Informe nome, cpf e dataNascimento.'
    });
  }

  const cpfJaExiste = pessoas.some((p) => p.cpf === cpf);
  if (cpfJaExiste) {
    return res.status(409).json({
      erro: 'Já existe uma pessoa cadastrada com esse CPF.'
    });
  }

  const novaPessoa = {
    id: proximoIdPessoa++,
    nome,
    cpf,
    dataNascimento
  };

  pessoas.push(novaPessoa);

  res.status(201).json({
    mensagem: 'Pessoa cadastrada com sucesso!',
    pessoa: novaPessoa
  });
});

app.get('/pessoas', (req, res) => {
  res.json(pessoas);
});

app.get('/pessoas/:id', (req, res) => {
  const id = Number(req.params.id);
  const pessoa = pessoas.find((p) => p.id === id);

  if (!pessoa) {
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }

  res.json(pessoa);
});

app.put('/pessoas/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nome, cpf, dataNascimento } = req.body;

  const pessoa = pessoas.find((p) => p.id === id);

  if (!pessoa) {
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }

  if (!nome || !cpf || !dataNascimento) {
    return res.status(400).json({
      erro: 'Informe nome, cpf e dataNascimento.'
    });
  }

  const cpfEmUso = pessoas.some((p) => p.cpf === cpf && p.id !== id);
  if (cpfEmUso) {
    return res.status(409).json({
      erro: 'Esse CPF já pertence a outra pessoa.'
    });
  }

  pessoa.nome = nome;
  pessoa.cpf = cpf;
  pessoa.dataNascimento = dataNascimento;

  res.json({
    mensagem: 'Pessoa atualizada com sucesso!',
    pessoa
  });
});

app.delete('/pessoas/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = pessoas.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }

  const temPassaporte = passaportes.some((pp) => pp.idPessoa === id);
  if (temPassaporte) {
    return res.status(409).json({
      erro: 'Essa pessoa possui passaporte. Exclua o passaporte primeiro.'
    });
  }

  pessoas.splice(indice, 1);

  res.json({ mensagem: 'Pessoa excluída com sucesso!' });
});

app.post('/passaportes', (req, res) => {
  const { numero, dataEmissao, dataValidade, idPessoa } = req.body;

  if (!numero || !dataEmissao || !dataValidade || !idPessoa) {
    return res.status(400).json({
      erro: 'Informe numero, dataEmissao, dataValidade e idPessoa.'
    });
  }

  if (dataValidade <= dataEmissao) {
    return res.status(400).json({
      erro: 'A dataValidade deve ser posterior à dataEmissao.'
    });
  }

  const pessoa = pessoas.find((p) => p.id === Number(idPessoa));
  if (!pessoa) {
    return res.status(404).json({
      erro: 'Pessoa não encontrada para o idPessoa informado.'
    });
  }

  const jaTemPassaporte = passaportes.some(
    (pp) => pp.idPessoa === Number(idPessoa)
  );
  if (jaTemPassaporte) {
    return res.status(409).json({
      erro: 'Essa pessoa já possui um passaporte.'
    });
  }

  const numeroJaExiste = passaportes.some((pp) => pp.numero === numero);
  if (numeroJaExiste) {
    return res.status(409).json({
      erro: 'Já existe um passaporte com esse número.'
    });
  }

  const novoPassaporte = {
    id: proximoIdPassaporte++,
    numero,
    dataEmissao,
    dataValidade,
    idPessoa: Number(idPessoa)
  };

  passaportes.push(novoPassaporte);

  res.status(201).json({
    mensagem: 'Passaporte cadastrado com sucesso!',
    passaporte: novoPassaporte
  });
});

app.get('/passaportes', (req, res) => {
  res.json(passaportes);
});

app.get('/passaportes/:id', (req, res) => {
  const id = Number(req.params.id);
  const passaporte = passaportes.find((pp) => pp.id === id);

  if (!passaporte) {
    return res.status(404).json({ erro: 'Passaporte não encontrado.' });
  }

  res.json(passaporte);
});

app.put('/passaportes/:id', (req, res) => {
  const id = Number(req.params.id);
  const { numero, dataEmissao, dataValidade, idPessoa } = req.body;

  const passaporte = passaportes.find((pp) => pp.id === id);

  if (!passaporte) {
    return res.status(404).json({ erro: 'Passaporte não encontrado.' });
  }

  if (!numero || !dataEmissao || !dataValidade || !idPessoa) {
    return res.status(400).json({
      erro: 'Informe numero, dataEmissao, dataValidade e idPessoa.'
    });
  }

  if (dataValidade <= dataEmissao) {
    return res.status(400).json({
      erro: 'A dataValidade deve ser posterior à dataEmissao.'
    });
  }

  const pessoa = pessoas.find((p) => p.id === Number(idPessoa));
  if (!pessoa) {
    return res.status(404).json({
      erro: 'Pessoa não encontrada para o idPessoa informado.'
    });
  }

  const outroPassaporteDaPessoa = passaportes.some(
    (pp) => pp.idPessoa === Number(idPessoa) && pp.id !== id
  );
  if (outroPassaporteDaPessoa) {
    return res.status(409).json({
      erro: 'Essa pessoa já possui outro passaporte.'
    });
  }

  const numeroEmUso = passaportes.some(
    (pp) => pp.numero === numero && pp.id !== id
  );
  if (numeroEmUso) {
    return res.status(409).json({
      erro: 'Esse número já pertence a outro passaporte.'
    });
  }

  passaporte.numero = numero;
  passaporte.dataEmissao = dataEmissao;
  passaporte.dataValidade = dataValidade;
  passaporte.idPessoa = Number(idPessoa);

  res.json({
    mensagem: 'Passaporte atualizado com sucesso!',
    passaporte
  });
});

app.delete('/passaportes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = passaportes.findIndex((pp) => pp.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Passaporte não encontrado.' });
  }

  passaportes.splice(indice, 1);

  res.json({ mensagem: 'Passaporte excluído com sucesso!' });
});

module.exports = app;