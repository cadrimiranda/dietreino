<template>
  <div class="w-full p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Treino do Cliente</h1>
        <p class="text-gray-600">
          {{ workout.name }} - Semana {{ workout.weekStart }}-{{
            workout.weekEnd
          }}
        </p>
      </div>
      <div class="flex space-x-3">
        <a-button @click="$router.push('/clients')">
          Voltar para Clientes
        </a-button>
        <a-button type="primary" @click="printWorkout">
          <printer-outlined /> Imprimir
        </a-button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow mb-6" ref="printArea">
      <div class="p-6">
        <div class="flex items-center mb-6">
          <div class="bg-blue-100 p-3 rounded-full mr-4">
            <user-outlined class="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ client.name }}</h2>
            <p class="text-gray-600">{{ client.email }}</p>
          </div>
          <div class="ml-auto">
            <a-tag color="green" v-if="workout.isActive">Ativo</a-tag>
            <a-tag color="gray" v-else>Inativo</a-tag>
          </div>
        </div>

        <div v-if="workoutSheets.length">
          <a-tabs>
            <a-tab-pane
              v-for="(sheet, index) in workoutSheets"
              :key="index"
              :tab="sheet.title"
            >
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-3 border text-left">Exercício</th>
                    <th class="p-3 border text-center w-24">Série</th>
                    <th class="p-3 border text-center w-40">Repetição</th>
                    <th class="p-3 border text-center w-32">Descanso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(exercise, exIndex) in sheet.exercises"
                    :key="exIndex"
                    class="hover:bg-gray-50"
                  >
                    <td class="p-3 border font-medium">
                      {{ exercise.name }}
                    </td>
                    <td class="p-3 border text-center">
                      {{ exercise.sets }}
                    </td>
                    <td class="p-3 border text-center">
                      {{ exercise.reps }}
                    </td>
                    <td class="p-3 border text-center">
                      {{ exercise.rest }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, onMounted, watch } from "vue";
import { UserOutlined, PrinterOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { IUserEntity, useUsers } from "@/composables/useUsers";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ClientWorkoutDetails",
  components: {
    UserOutlined,
    PrinterOutlined,
  },
  props: {
    clientId: {
      type: String,
      required: true,
    },
    workoutId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRoute();
    const userId = router.params.clientId as string;
    const { user } = useUsers({ userId });

    const client = reactive<IUserEntity>({
      id: "",
      name: "",
      email: "",
      phone: "",
      createdAt: "",
      updatedAt: "",
    });

    // Observe as mudanças em user e atualize client quando os dados chegarem
    watch(
      user,
      (newUser) => {
        console.log("User data:", newUser);
        if (newUser && newUser && newUser.user) {
          Object.assign(client, newUser.user);
        }
      },
      { immediate: true }
    );

    const workout = reactive({
      id: props.workoutId,
      name: "Treino de Força",
      weekStart: 1,
      weekEnd: 5,
      isActive: true,
    });

    const workoutSheets = ref([
      {
        title: "A - Costas e Posterior",
        exercises: [
          {
            name: "Remada curvada barra pronada",
            sets: 3,
            reps: "10-12, 8-10, 8-10",
            rest: "2-3min",
          },
          {
            name: "Remada baixa barra romana",
            sets: 4,
            reps: "8-10, 8-10, 6-8, 6-8",
            rest: "2min",
          },
          {
            name: "Puxador frente triângulo",
            sets: 3,
            reps: "8-10",
            rest: "2min",
          },
          {
            name: "Posterior de ombro na polia",
            sets: 2,
            reps: "8-10",
            rest: "60-90s",
          },
          {
            name: "Crucifixo invertido maq. neutra",
            sets: 3,
            reps: "6-8",
            rest: "2min",
          },
          {
            name: "Panturrilha em pé maq.",
            sets: 4,
            reps: "8-10",
            rest: "60-90s",
          },
        ],
      },
      {
        title: "B - Peito e Anterior",
        exercises: [
          {
            name: "Supino reto barra",
            sets: 3,
            reps: "10-12, 8-10, 6-8",
            rest: "2-3min",
          },
          {
            name: "Supino inclinado halteres",
            sets: 3,
            reps: "8-10",
            rest: "2min",
          },
          { name: "Crucifixo máquina", sets: 3, reps: "10-12", rest: "90s" },
          {
            name: "Desenvolvimento máquina",
            sets: 3,
            reps: "8-10",
            rest: "2min",
          },
          { name: "Elevação lateral", sets: 3, reps: "10-12", rest: "90s" },
          { name: "Rosca direta barra W", sets: 3, reps: "8-10", rest: "90s" },
        ],
      },
      {
        title: "C - Pernas",
        exercises: [
          {
            name: "Agachamento barra",
            sets: 4,
            reps: "10-12, 8-10, 8-10, 6-8",
            rest: "2-3min",
          },
          { name: "Leg press 45°", sets: 3, reps: "10-12", rest: "2min" },
          { name: "Cadeira extensora", sets: 3, reps: "12-15", rest: "90s" },
          { name: "Mesa flexora", sets: 3, reps: "10-12", rest: "90s" },
          { name: "Stiff", sets: 3, reps: "8-10", rest: "2min" },
          { name: "Panturrilha sentado", sets: 4, reps: "15-20", rest: "60s" },
        ],
      },
    ]);

    const printArea = ref(null);

    // Em um caso real, você buscaria estes dados da API
    onMounted(() => {
      // fetchWorkoutData(props.clientId, props.workoutId);
    });

    // Função para imprimir o treino em PDF
    const printWorkout = () => {
      const element = printArea.value;
      const opt = {
        margin: 10,
        filename: `treino-${client.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      message.loading({ content: "Gerando PDF...", key: "pdf" });
    };

    return {
      client,
      workout,
      workoutSheets,
      printArea,
      printWorkout,
    };
  },
});
</script>
