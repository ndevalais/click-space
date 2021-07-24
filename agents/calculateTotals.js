let  i = 0;
let calculateTotals = function(){
    console.log("Calcular totales...", i++);
}

var agent = {
    AgentType: "methodRunner",    
    method: calculateTotals,
    agentName: 'Calculate totals',
    runsEvery: 5,
    runsInmediate:true
};



module.exports = agent;