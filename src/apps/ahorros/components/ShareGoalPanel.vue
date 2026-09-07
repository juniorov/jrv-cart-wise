<script setup>
import { computed, ref } from 'vue'
import { inviteToGoal, removeCollaborator } from '@/apps/ahorros/services/objetivos'

const props = defineProps({
  goal: { type: Object, required: true },
})
const emit = defineEmits(['changed'])

const email = ref('')
const role = ref('editor')
const error = ref('')
const submitting = ref(false)

const collaborators = computed(() => Object.entries(props.goal.sharedWith ?? {}))
const pending = computed(() => Object.entries(props.goal.pendingInvites ?? {}))

async function handleInvite() {
  error.value = ''
  if (!email.value.trim()) return
  submitting.value = true
  try {
    await inviteToGoal(props.goal.id, email.value.trim(), role.value)
    email.value = ''
    emit('changed')
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

async function handleRemove(uid) {
  if (!confirm('¿Quitar el acceso de esta persona al objetivo?')) return
  await removeCollaborator(props.goal.id, uid)
  emit('changed')
}
</script>

<template>
  <div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3"><i class="bi bi-people-fill me-2"></i>Compartir objetivo</h2>
      <p class="text-muted small">
        Solo se comparte este objetivo, nunca tus cuentas ni entidades bancarias.
      </p>

      <form class="row g-2 align-items-end mb-3" @submit.prevent="handleInvite">
        <div class="col-12 col-sm-7">
          <label class="form-label" for="invite-email">Email</label>
          <input id="invite-email" v-model="email" type="email" class="form-control" required />
        </div>
        <div class="col-6 col-sm-3">
          <label class="form-label" for="invite-role">Rol</label>
          <select id="invite-role" v-model="role" class="form-select">
            <option value="editor">Puede editar</option>
            <option value="viewer">Solo ver</option>
          </select>
        </div>
        <div class="col-6 col-sm-2">
          <button type="submit" class="btn btn-primary w-100" :disabled="submitting">Invitar</button>
        </div>
      </form>
      <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

      <div v-if="collaborators.length > 0" class="mb-3">
        <h3 class="h6 small text-muted">Con acceso</h3>
        <ul class="list-group list-group-flush">
          <li
            v-for="[uid, r] in collaborators"
            :key="uid"
            class="list-group-item d-flex justify-content-between align-items-center px-0"
          >
            <span>{{ uid.slice(0, 8) }}… <span class="badge text-bg-light">{{ r === 'editor' ? 'Edita' : 'Ve' }}</span></span>
            <button class="btn btn-sm btn-outline-danger" @click="handleRemove(uid)">
              <i class="bi bi-x-lg"></i>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="pending.length > 0">
        <h3 class="h6 small text-muted">Invitaciones pendientes</h3>
        <ul class="list-group list-group-flush">
          <li v-for="[invitedEmail, r] in pending" :key="invitedEmail" class="list-group-item px-0">
            {{ invitedEmail }}
            <span class="badge text-bg-light">{{ r === 'editor' ? 'Edita' : 'Ve' }}</span>
            <span class="text-muted small">— se activa cuando inicie sesión</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
