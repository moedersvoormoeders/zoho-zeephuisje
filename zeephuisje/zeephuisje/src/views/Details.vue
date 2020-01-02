<template>
  <div class="container" id="app">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <div class="row">
        <div class="col-12 mb-2 mt-2">
          <span class="float-left">
            <button
              type="button"
              class="btn btn-light btn-lg"
              :disabled="saving"
              v-on:click="goBack()"
            >
              <font-awesome-icon :icon="['fad', 'long-arrow-left']" /> Terug
            </button>
          </span>
          <span class="float-right">
            <button
              type="button"
              class="btn btn-info btn-lg mr-2"
              v-on:click="pakketVandaag()"
              :disabled="saving"
            >
              <font-awesome-icon :icon="['fad', 'box-heart']" /> Pakket Vandaag
            </button>
            <button
              type="button"
              class="btn btn-success btn-lg"
              v-on:click="save()"
              :disabled="saving || !hasChanges()"
            >
              <font-awesome-icon :icon="['far', 'save']" /> Opslaan
            </button>
          </span>
        </div>
      </div>
      <h3>Info</h3>
      <div class="row mb-3">
        <div class="col-4 mb-3">
          <h5>Naam</h5>
          {{info.name}}
        </div>
        <div class="col-4 mb-3">
          <h5>Doelgroepnummer</h5>
          {{info.doelgroepnummer}}
        </div>
        <div class="col-4 mb-3">
          <h5>Code</h5>
          {{info.code}}
        </div>
        <div class="col-4">
          <h5>Huishouden</h5>
          <pre>{{info.huishouden}}</pre>
        </div>
        <div class="col-4">
          <h5>Opmerking</h5>
          <textarea class="form-control" v-model="opmerking" rows="2"></textarea>
        </div>
        <div class="col-4">
          <h5>Totalen</h5>
          <ul>
            <li v-for="total in totals" v-bind:key="total.naam">{{total.naam}}: {{total.aantal}}
              <span v-if="total.naam=='Overtrek 2 Personen'">/ 2</span>
              <span v-if="total.naam=='Overtrek 1 Persoon'">/ {{2 * aantalKinderen }}</span>  
            </li>
          </ul>
        </div>
      </div>
      <div class="row">
        <h3 class="col-12">
          Pakketten
          <span class="float-right">
            <button type="button" class="btn btn-success" v-on:click="addPakketRow()">
              <font-awesome-icon :icon="['fas', 'plus-square']" /> Rij Toevoegen
            </button>
          </span>
        </h3>
      </div>
      <table class="table">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">Gegeven</th>
            <th scope="col">Opmerking</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pakket in pakketten" v-bind:key="pakket.id">
            <td>
              <datepicker :format="'yyyy-MM-dd'" v-model="pakket.datum"></datepicker>
            </td>
            <td>
              <div class="row" v-for="item in pakket.gekregen" v-bind:key="item.id">
                <div class="col-2">
                  <input v-model="item.aantal" class="form-control" type="number" min="1" />
                </div>
                <div class="col">
                  <multiselect
                    v-model="item.naam"
                    :options="getPakketOptions(pakket)"
                    placeholder="Selecteer een"
                  ></multiselect>
                </div>
                <div class="col-2">
                  <button
                    type="button"
                    class="btn btn-outline-danger mt-1"
                    v-on:click="removeItem(pakket, item.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'minus-circle']" />
                  </button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button
                    type="button"
                    class="btn btn-outline-primary mt-2"
                    v-on:click="addItem(pakket)"
                  >
                    <font-awesome-icon :icon="['fas', 'plus-square']" /> Item Toevoegen
                  </button>
                </div>
              </div>
            </td>
            <td>
              <input v-model="pakket.opmerking" class="form-control" placeholder="Opmerking" />
            </td>
            <td>
              <button
                type="button"
                class="btn btn-outline-danger"
                v-on:click="removePakket(pakket)"
              >
                <font-awesome-icon :icon="['fad', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="row">
        <h3 class="col-12">
          Goederen
          <span class="float-right">
            <button type="button" class="btn btn-success" v-on:click="addGoederenRow()">
              <font-awesome-icon :icon="['fas', 'plus-square']" /> Rij Toevoegen
            </button>
          </span>
        </h3>
      </div>
      <table class="table">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">Gegeven</th>
            <th scope="col">Opmerking</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goederPakket in goederen" v-bind:key="goederPakket.id">
            <td>
              <datepicker :format="'yyyy-MM-dd'" v-model="goederPakket.datum"></datepicker>
            </td>
            <td>
              <div class="row" v-for="item in goederPakket.gekregen" v-bind:key="item.id">
                <div class="col-2">
                  <input v-model="item.aantal" class="form-control" type="number" min="1" />
                </div>
                <div class="col">
                  <multiselect
                    v-model="item.naam"
                    :options="getGoederenOptions(goederPakket)"
                    placeholder="Selecteer een"
                  ></multiselect>
                </div>
                <div class="col-2">
                  <button
                    type="button"
                    class="btn btn-outline-danger mt-1"
                    v-on:click="removeItem(goederPakket, item.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'minus-circle']" />
                  </button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button
                    type="button"
                    class="btn btn-outline-primary mt-2"
                    v-on:click="addItem(goederPakket)"
                  >
                    <font-awesome-icon :icon="['fas', 'plus-square']" /> Item Toevoegen
                  </button>
                </div>
              </div>
            </td>
            <td>
              <input v-model="goederPakket.opmerking" class="form-control" placeholder="Opmerking" />
            </td>
            <td>
              <button
                type="button"
                class="btn btn-outline-danger"
                v-on:click="removeGoederen(goederPakket)"
              >
                <font-awesome-icon :icon="['fad', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import Multiselect from "vue-multiselect";

function formatDate(d) {
  var month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

export default {
  props: ["id"],
  components: {
    Datepicker,
    Multiselect
  },
  data: function() {
    return {
      loading: true,
      pakketten: [],
      goederen: [],
      originalPakket: "", //JSON stored here
      originalGoederen: "", //JSON stored here
      nextID: 1,
      nextRowID: 1,
      saving: false,
      recordID: "",
      info: {},
      opmerking: "",
      pakketOptions: [
        // TODO: not hard code these
        "Pakket",
        "Luiers 1",
        "Luiers 2",
        "Luiers 3",
        "Luiers 4",
        "Luiers 5",
        "Luiers 1 EU",
        "Luiers 2 EU",
        "Luiers 3 EU",
        "Luiers 4 EU",
        "Luiers 5 EU"
      ],
      goederenOptions: [
        // TODO: not hard code these
        "Overtrek 1 Persoon",
        "Overtrek 2 Personen",
        "Lakens 1 Persoon",
        "Lakens 2 Personen",
        "Kussensloop",
        "Handdoek",
        "Badlaken",
        "Washandje",
        "Dons 1 Persoon",
        "Dons 2 Personen",
        "Deken 1 Persoon",
        "Deken 2 Personen",
        "Hoofdkussen",
        "Fleecedeken",
        "Bedsprei",
        "Matrasbeschermer",
        "Badmat",
        "Tafelkleed",
        "Keukenhanddoek",
        "Toiletzak",
        "Slaapzak",
        "Kamppakket"
      ]
    };
  },
  computed: {
    totals: function() {
      let today = new Date()
      let totals = {}

      for (let pakket of this.goederen) {
        if (pakket.datum.getFullYear() === today.getFullYear()) {
          for (let item of pakket.gekregen) {
            if (!item.naam) {
              continue
            }
            if (!totals[item.naam]) {
              totals[item.naam] = 0
            }
            totals[item.naam] += parseInt(item.aantal)
          }
        }
      }

      let totalsArray = []
      for (let total in totals) {
        totalsArray.push({
          naam: total,
          aantal: totals[total],
        })
      }
      return totalsArray.sort((a,b)=> (a||{}).naam > (b||{}).naam)
    },
    aantalKinderen: function() {
      // small hack to not add more fields in Zoho
      return this.info.huishouden.split("Meisje").length + this.info.huishouden.split("Jongen").length - 2 // 4 is the default if empty
    }
  },
  methods: {
    hasChanges: function() {
      console.log(JSON.stringify(this.info))
      if (JSON.stringify(this.pakketten) != this.originalPakket) {
        return true;
      }
      if (JSON.stringify(this.goederen) != this.originalGoederen) {
        return true;
      }
      if (this.info.opmerking != this.opmerking) {
        return true;
      }
      console.log(JSON.stringify(this.info))

      return false;
    },
    goBack: function() {
      let vm = this;
      let confirmFn = function() {
        vm.$router.push({ name: "search" });
      };
      if (this.hasChanges()) {
        this.$Simplert.open({
          title: "Er zijn niet opgeslagen wijzigingen!",
          message: "Ben je zeker dat je wil terug gaan?",
          type: "info",
          useConfirmBtn: true,
          onConfirm: confirmFn,
          customConfirmBtnClass: "btn btn-warning",
          customConfirmBtnText: "Ga Terug",
          customCloseBtnText: "Sluiten"
        });
      } else {
        confirmFn();
      }
    },
    pakketVandaag: function() {
      const today = new Date();
      for (let pakket of this.pakketten) {
        if (pakket.datum.getMonth() === today.getMonth()) {
          for (let item of pakket.gekregen) {
            if (item.naam === "Pakket") {
              this.$Simplert.open({
                title: "Let Op!",
                message: "Heeft deze maand al een pakket gehad!",
                type: "error",
                customCloseBtnText: "Sluiten"
              });
              return;
            }
          }
        }
      }

      this.pakketten = [
        {
          datum: new Date(),
          gekregen: [
            {
              naam: "Pakket",
              aantal: 1,
              id: this.nextID
            }
          ],
          opmerking: "",
          id: this.nextRowID
        }
      ].concat(this.pakketten);

      this.nextRowID++;
      this.nextID++;
      this.save();
    },
    addItem: function(pakket) {
      pakket.gekregen.push({
        aantal: 1,
        id: this.nextID,
        naam: ""
      });

      this.nextID++;
    },
    removeItem: function(pakket, id) {
      pakket.gekregen = pakket.gekregen.filter(function(value) {
        return value.id != id;
      });
    },
    addPakketRow: function() {
      this.pakketten = [
        {
          datum: new Date(),
          gekregen: [],
          opmerking: "",
          id: this.nextRowID
        }
      ].concat(this.pakketten);

      this.nextRowID++;
    },
    addGoederenRow: function() {
      this.goederen = [
        {
          datum: new Date(),
          gekregen: [],
          opmerking: "",
          id: this.nextRowID
        }
      ].concat(this.goederen);

      this.nextRowID++;
    },
    getPakketOptions: function(pakket) {
      return this.pakketOptions.filter(function(value) {
        for (let hadItem of pakket.gekregen) {
          if (hadItem.naam == value) {
            return false;
          }
        }

        return true;
      });
    },
    getGoederenOptions: function(pakket) {
      return this.goederenOptions.filter(function(value) {
        for (let hadItem of pakket.gekregen) {
          if (hadItem.naam == value) {
            return false;
          }
        }

        return true;
      });
    },
    removePakket: function(pakket) {
      this.pakketten = this.pakketten.filter(function(value) {
        return value.id != pakket.id;
      });
    },
    removeGoederen: function(pakket) {
      this.goederen = this.goederen.filter(function(value) {
        return value.id != pakket.id;
      });
    },
    save: function() {
      let vm = this;
      this.saving = true;

      let zohoPakketten = [];
      let donePakketDatum = {};

      for (let pakket of this.pakketten) {
        for (let item of pakket.gekregen) {
          if (item.naam == "") {
            vm.$Simplert.open({
                title: "Veld niet ingevuld!",
                message: "Een van de items heeft gen pakket type geselecteerd!",
                type: "error",
                customCloseBtnText: "Sluiten"
            });
            this.saving = false;
            return
          }
          zohoPakketten.push({
            Datum: formatDate(pakket.datum),
            id1: item.id,
            Gekregen: [item.naam],
            aantal: item.aantal,
            Opmerking: donePakketDatum[pakket.datum] ? "" : pakket.opmerking
          });
          donePakketDatum[pakket.datum] = true;
        }
      }

      let zohoGoederen = [];
      let doneGoederenDatum = {};

      for (let pakket of this.goederen) {
        for (let item of pakket.gekregen) {
          if (item.naam == "") {
            vm.$Simplert.open({
                title: "Veld niet ingevuld!",
                message: "Een van de items heeft gen pakket type geselecteerd!",
                type: "error",
                customCloseBtnText: "Sluiten"
            });
            this.saving = false;
            return
          }
          zohoGoederen.push({
            Datumm: formatDate(pakket.datum),
            id1: item.id,
            Gekregen: [item.naam],
            aantal: item.aantal,
            Opemerking: doneGoederenDatum[pakket.datum] ? "" : pakket.opmerking
          });
          doneGoederenDatum[pakket.datum] = true;
        }
      }

      window.ZOHO.CRM.API.updateRecord({
        Entity: "Zeephuisje",
        Trigger: ["workflow"],
        APIData: {
          id: this.recordID,
          Paketten: zohoPakketten,
          Goederen: zohoGoederen,
          Opmerking: vm.info.opmerking,
        }
      }).then(function() {
        vm.saving = false;
        vm.$Simplert.open({
          title: "Opgeslagen!",
          message: "",
          type: "success",
          customCloseBtnText: "Sluiten"
        });

        vm.originalPakket = JSON.stringify(vm.pakketten);
        vm.originalGoederen = JSON.stringify(vm.goederen);
        vm.info.opmerking = vm.opmerking;
      });
    }
  },

  created: function() {
    let vm = this;

    vm.recordID = vm.$route.params.id;
    window.ZOHO.CRM.API.getRecord({
      Entity: "Zeephuisje",
      RecordID: vm.recordID
    }).then(function(response) {
      console.log(response);

      vm.info.name = `${response.data[0].Voornaam} ${response.data[0].Naam}`;
      vm.info.huishouden = response.data[0].Huishouden;
      vm.info.doelgroepnummer = response.data[0].Doelgroep_Nummer;
      vm.info.code = response.data[0].Code;
      vm.info.opmerking = response.data[0].Opmerking ? response.data[0].Opmerking  : "";

      let maxID = 1;
      let rowID = 1;
      let pakketVoorDatum = {};
      for (let pakket of response.data[0].Paketten) {
        if (!pakketVoorDatum[pakket.Datum]) {
          pakketVoorDatum[pakket.Datum] = {
            datum: new Date(pakket.Datum),
            gekregen: [],
            opmerking: "",
            id: rowID
          };
        }

        pakketVoorDatum[pakket.Datum].gekregen.push({
          aantal: pakket.aantal,
          id: pakket.id1,
          naam: pakket.Gekregen[0]
        });

        pakketVoorDatum[pakket.Datum].opmerking += pakket.Opemerking
          ? pakket.Opemerking
          : "";

        if (pakket.id1 > maxID) {
          maxID = pakket.id1;
        }
        rowID++;
      }

      for (let datum in pakketVoorDatum) {
        if (pakketVoorDatum.hasOwnProperty(datum)) {
          vm.pakketten.push(pakketVoorDatum[datum]);
        }
      }

      let goederenVoorDatum = {};
      for (let pakket of response.data[0].Goederen) {
        if (!goederenVoorDatum[pakket.Datumm]) {
          goederenVoorDatum[pakket.Datumm] = {
            datum: new Date(pakket.Datumm),
            gekregen: [],
            opmerking: "",
            id: rowID
          };
        }

        for (let item of pakket.Gekregen) {
          // legacy data fix
          goederenVoorDatum[pakket.Datumm].gekregen.push({
            aantal: pakket.aantal ? pakket.aantal : 1, // legacy data fix
            id: pakket.id1 ? pakket.id1 : maxID + 1, // legacy data fix
            naam: item
          });
          if (!pakket.id1) {
            // legacy data fix
            maxID++;
          }
        }

        goederenVoorDatum[pakket.Datumm].opmerking += pakket.Opmerking
          ? pakket.Opmerking
          : "";

        if (pakket.id1 > maxID) {
          maxID = pakket.id1;
        }
        rowID++;
      }

      for (let datum in goederenVoorDatum) {
        if (goederenVoorDatum.hasOwnProperty(datum)) {
          vm.goederen.push(goederenVoorDatum[datum]);
        }
      }

      vm.originalPakket = JSON.stringify(vm.pakketten);
      vm.originalGoederen = JSON.stringify(vm.goederen);
      vm.opmerking = vm.info.opmerking;

      vm.nextID = maxID + 1;
      vm.nextRowID = rowID + 1;
      vm.loading = false;
    });
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
  ul {
    padding-left: 20px;
  }
</style>