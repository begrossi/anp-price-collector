# anp-price-collector
ANP Price Collector

* Esse projeto é composto de 3 módulos:
  - collector: Coletor dos dados a partir da página da ANP.
  - server: servidor com acesso via API
  - frontend: conteúdo HTML/JS em AngularJS para consulta dos dados coletados.


* Collector:
  - O coletor é um script nodejs que lê, faz o parse da página, e consome todas as informações da página.
  - Primeiramente, busca uma página inicial com a lista de estados e tipos de combustível.
  - Para cada estado, em paralelo, faz uma busca da lista de cidades para cada tipo de combustível. E para cada cidade e tipo de combustível, busca a lista de postos pesquisados.
  - Após acumular todos os dados de um estado, envia para o `server` através de API.
  - A decisão de não dar acesso ao banco de dados direto ao Collector, e sim fazê-lo enviar os dados via API permite 
que esse componente rode de forma autônoma, podendo-se utilizar, por exemplo o AWS Lambda para consumir processamento apenas uma vez por semana.

* Server:
  - Servidor de APIs REST, baseado no HapiJS, com acesso ao banco MongoDB.
  - Os modelos de dados focam em otimizar a busca por dados na API de consulta, operação que seria mais custosa.
    - Os dados são armazenados muito próximos à como serão consutados, no model `anpdata`, ficando os demais modelos apenas como auxiliares.

* Frontend: (ainda não implementado)
  - Conjunto de páginas HTML e scripts JS baseados em AngularJS, com suporte à SASS e mimificação de forma a gerar conteúdo estático e totalmente independente do servidor, acessando este através de APIs REST.

  