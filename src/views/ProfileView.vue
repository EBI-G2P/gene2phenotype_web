<script>
import { mapState } from "pinia";
import { useAuthStore } from "../store/auth.js";

export default {
  computed: {
    ...mapState(useAuthStore, ["userName", "userEmail", "userPanels"]),
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">Profile</h2>
    <div class="mb-3">
      <table class="table" style="max-width: 80%">
        <tbody>
          <tr>
            <th>Username</th>
            <td>{{ userName }}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{{ userEmail }}</td>
          </tr>
          <tr>
            <th>Panel(s)</th>
            <td>
              <span v-if="userPanels?.length > 0">
                {{ userPanels.join(", ") }}
              </span>
              <span v-else class="text-muted">No permission to edit</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <router-link to="/change-password" class="btn btn-primary">
      Change password
    </router-link>
  </div>
</template>
