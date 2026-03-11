
import { createFileRoute } from '@tanstack/react-router'
import { GerenciarUsuarios } from '../../components/dashboard/GerenciarUsuarios'

const summaryCards = [
  { title: 'Dízimos do mês', value: 'R$ 38.750', change: '+12% em relação ao mês anterior' },
  { title: 'Ofertas registradas', value: 'R$ 12.260', change: '+6% sobre a média mensal' },
  { title: 'Despesas do mês', value: 'R$ 17.920', change: '-3% frente ao último mês' },
  { title: 'Saldo disponível', value: 'R$ 32.150', change: 'Saldo em evolução constante' },
]

const contributionLog = [
  { type: 'Dízimo', member: 'João Oliveira', amount: 'R$ 210', date: '12 de março', method: 'Pix' },
  { type: 'Oferta', member: 'Marina Pereira', amount: 'R$ 450', date: '12 de março', method: 'Dinheiro' },
  { type: 'Dízimo', member: 'Equipe de Louvor', amount: 'R$ 870', date: '11 de março', method: 'Cartão' },
]

const membersData = [
  { name: 'Pastor Rafael', ministry: 'Pastores', phone: '+55 11 98877-4455', email: 'rafael@igreja.com' },
  { name: 'Equipe de Louvor', ministry: 'Louvor', phone: '+55 11 98877-3344', email: 'louvor@igreja.com' },
  { name: 'Camila Souza', ministry: 'Intercessão', phone: '+55 11 99988-2233', email: 'camila@igreja.com' },
]

const expensesData = [
  { category: 'Infraestrutura', description: 'Troca de lâmpadas do salão principal', amount: 'R$ 2.400', date: '09 de março' },
  { category: 'Eventos', description: 'Coffee break culto familiar', amount: 'R$ 980', date: '10 de março' },
  { category: 'Transporte', description: 'Combustível van comunitária', amount: 'R$ 620', date: '08 de março' },
]

const campaigns = [
  { name: 'Reforma do salão', goal: 'R$ 60.000', raised: 'R$ 36.400', progress: 64 },
  { name: 'Viagem Missionária', goal: 'R$ 25.000', raised: 'R$ 8.500', progress: 34 },
]

const chartValues = [42, 58, 67, 74, 86, 72, 95, 104, 98, 84, 88, 102]
const chartLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
