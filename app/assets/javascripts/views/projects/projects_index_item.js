BasecampApp.Views.ProjectsIndexItem = Backbone.View.extend({
  template: JST['projects/index_item'],
  tagName: "ul",
  className: "projects-index-item",

  events: {
    'click .delete-project': "destroyProject",
    'click .index-item-body': "show"
  },


  initialize: function () {
    this.listenTo(this.model, 'sync', this.render);
  },

  destroyProject: function (event) {
    event.preventDefault();
    this.model.destroy();
    this.remove();
  },

  render: function () {
    var content = this.template({ project: this.model });
    this.$el.html(content);
    return this;
  },

  show: function (event) {
    if ($(event.target).hasClass('delete-project')) { return };
    Backbone.history.navigate("/projects/" + this.model.escape('id'), { trigger: true });
  }
});