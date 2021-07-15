# watch-loal-packages

## o que é?

É um sistema que facilita a alteração de arquivos de uma dependencia do react, sendo que toda alteração feita em algum arquivo da dependencia reflete diretamente no projeto que a utiliza.

## como funciona?

Busca no package.json do projeto indicado as dependencias com referencia local, ou seja em que no lugar da versão do pacote tenha a referencia do diretório ("file../dependencia" ou "../dependencia"). Então cria um watch ("fb-watchman") que escuta as alterações realizadas nos arquivos e copia estes arquivos alterados para o node_modules do projeto base.

## como utiizar?

Coloque a dependencia no package.json se referindo a pasta local, como é feito normalmente:

```json
"dependencies": {
  "mov-seguroempresarial-movapp": "file:../mov-seguroempresarial-movapp",
}
```

ou

```json
"dependencies": {
  "mov-seguroempresarial-movapp": "../mov-seguroempresarial-movapp",
}
```

Desta forma o sistema vai conseguir encontrar o diretório da dependencia automaticamente, caso tenha mais de uma dependencia referida da mesma forma os sistema vai criar o symlink para todas

Descompacte os arquivos em algum diretório, recomendo descompactar dentro do diretório que tenha os projetos, sendo assim a execução fica mais simples. Por exemplo:

![Diretórios](/Screenshot from 2021-07-15 07-50-25.png)

Desta forma levando em consideração que mov-seguroempresarial-movapp é uma dependencia de mov-react-native-brasilseg, para iniciar a escuta o comado seria:

ˋˋˋ
~/git_mobile/watch-local-packages $node index.js --project=mov-react-native-brasilseg
ˋˋˋ

caso o diretório do watch fique em outro diretório, diferente da estrutura na iagem acima, por exemplo assim:

![Diretórios](/Screenshot from 2021-07-15 08-12-48.png)

![Diretórios](/Screenshot from 2021-07-15 08-13-02.png)

Desta forma o comando seria:

ˋˋˋ
~/git_mobile/watch-local-packages $node index.js --path=../mov-react-native-brasilseg
ˋˋˋ
