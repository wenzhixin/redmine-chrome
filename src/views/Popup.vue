<template>
  <div class="main">
    <ListGroup>
      <ListGroupItem>
        <div class="list-group-item-heading">
          <div class="fl">
            <span class="badge label-%s">%s</span>
            <span class="f12 mr10">%s</span>
          </div>
          <div class="fr">
            <span>%s</span>
            <span class="f14" title="%s">(%s)</span>
          </div>
        </div>
        <p class="list-group-item-text cb pt10">
          <a class="copy-issue f16 mr5 cp" i18n-properties="title:copy_issue_id">
            <i class="fa fa-copy"></i>
          </a>
          <a href="%s" class="mr5" target="_blank">%s #%s: </a> %s
        </p>
      </ListGroupItem>
    </ListGroup>
  </div>
</template>

<script setup>

</script>

<style scoped>
.main {
  width: 520px;
}
</style>
