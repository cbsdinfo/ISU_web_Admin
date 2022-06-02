<template>
  <div>
    跳轉中，請稍等...
  </div>
</template>

<script>
export default {
  name: "OidcRedirect",
  created() {
    if (this.$store.getters.oidcUser) {
      this.$router.push("/");
    }
  },
};
</script>
