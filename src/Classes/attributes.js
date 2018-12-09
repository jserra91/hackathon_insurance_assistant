module.exports = class attributes {
  constructor() {
    this.googleid = "";
    this.pruebaNombre = "";
    this.templateBody = [];
    this.bodyResponse = new bodyResponse();
    this.display = false;
    this.pruebaCard = "";
    this.pause = "";
    this.pruebaNombre = "";
    this.pause = "0.6s";
    this.tipo = "";
    this.dni = "";
    this.resultados = [];
  }

  clear() {
    this.alexaid = "";
    this.pruebaNombre = "";
    this.templateBody = [];
    this.bodyResponse = new bodyResponse();
    this.display = false;
    this.pruebaCard = "";
    this.pause = "";
    this.pruebaNombre = "";
    this.pause = "0.6s";
    this.tipo = "";
    this.dni = "";
    this.resultados = [];
  }

  init(values) {
    this.alexaid = values.alexaid;
    this.pruebaNombre = values.pruebaNombre;
    this.templateBody = [];
    values.templateBody.forEach(element => {
      this.templateBody.push(String(element));
    });
    this.bodyResponse = new bodyResponse().init(values.bodyResponse);
    this.display = values.display;
    this.pruebaCard = values.pruebaCard;
    this.pause = values.pause;
    this.pruebaNombre = values.pruebaNombre;
    this.pause = "0.6s";
    this.tipo = values.tipo;
    this.dni = values.dni;
    this.resultados = values.resultados;
    return this;
  }

  toJSON() {
    return Object.getOwnPropertyNames(this).reduce((a, b) => {
      a[b] = this[b];
      return a;
    }, {});
  }
};

class bodyResponse {
  constructor() {
    this.MIME = "";
    this.Type = "";
    this.assistant = "";
    this.tittle = "";
    this.URL = "";
    this.imgOscura = "";
  }

  clear() {
    this.MIME = "";
    this.Type = "";
    this.assistant = "";
    this.tittle = "";
    this.URL = "";
    this.imgOscura = "";
  }

  init(values) {
    this.MIME = values.MIME;
    this.Type = values.Type;
    this.assistant = values.assistant;
    this.tittle = values.tittle;
    this.URL = values.URL;
    this.imgOscura = values.imgOscura;
    return this;
  }

  toJSON() {
    return Object.getOwnPropertyNames(this).reduce((a, b) => {
      a[b] = this[b];
      return a;
    }, {});
  }
}
