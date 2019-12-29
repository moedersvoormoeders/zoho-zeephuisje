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
            <a href="#/search">
              <button type="button" class="btn btn-light btn-lg" :disabled="saving">
                <i class="fad fa-long-arrow-left"></i> Terug
              </button>
            </a>
          </span>
          <span class="float-right">
            <button
              type="button"
              class="btn btn-success btn-lg"
              v-on:click="save()"
              :disabled="saving"
            >
              <i class="far fa-save"></i> Opslaan
            </button>
          </span>
        </div>
      </div>
      <h3>Info</h3>
      <div class="row mb-3">
        <div class="col-6 mb-3">
          <h5>Naam</h5>
          {{info.name}}
        </div>
        <div class="col-6 mb-3">
          <h5>Doelgroepnummer</h5>
          {{info.doelgroepnummer}}
        </div>
        <div class="col-6">
          <h5>Huishouden</h5>
          <pre>{{info.huishouden}}</pre>
        </div>
        <div class="col-6">
          <h5>Stop</h5>Coming sooon!
        </div>
      </div>
      <h3>Pakketten</h3>
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
                    <i class="fas fa-minus-circle"></i>
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
                    <i class="fas fa-plus-square"></i> Item Toevoegen
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
                <i class="fad fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="btn btn-success" v-on:click="addPakketRow()">
        <i class="fas fa-plus-square"></i> Rij Toevoegen
      </button>
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
      nextID: 1,
      nextRowID: 1,
      saving: false,
      recordID: "",
      info: {},
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
      ]
    };
  },

  methods: {
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
    removePakket: function(pakket) {
      this.pakketten = this.pakketten.filter(function(value) {
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

      window.ZOHO.CRM.API.updateRecord({
        Entity: "Zeephuisje",
        Trigger: ["workflow"],
        APIData: {
          id: this.recordID,
          Paketten: zohoPakketten
        }
      }).then(function() {
        vm.saving = false;
        vm.$Simplert.open({
          title: 'Opgeslagen!',
          message: "",
          type: 'success',
          customCloseBtnText: 'Sluiten',
        })
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

        pakketVoorDatum[pakket.Datum].opmerking += pakket.Opmerking
          ? pakket.Opmerking
          : "";

        if (pakket.id > maxID) {
          maxID = pakket.id1;
        }
        rowID++;
      }

      for (let datum in pakketVoorDatum) {
        if (pakketVoorDatum.hasOwnProperty(datum)) {
          vm.pakketten.push(pakketVoorDatum[datum]);
        }
      }

      vm.nextID = maxID + 1;
      vm.nextRowID = rowID + 1;
      vm.loading = false;
    });
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>