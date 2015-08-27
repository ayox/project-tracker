BasecampApp.Views.ProjectShow = Backbone.CompositeView.extend({
  template: JST["projects/project_show/show"],
  className: "project-show",

  events: {
    "click #tasks-completed": "toggleActiveFolder",
    "click #tasks-incomplete": "toggleActiveFolder",
    "click .invite-users": "inviteUsers",
    "click #new-task": "newTask",
    "click .project-link": "showTree",
    "click .project-title": "editTitle",
    "click .project-description-text": "editDescription",
    "click .tag-user": "tagUser",
    "click .upload-button": "upload",
    "blur input.editing": "updateAndSave",
    "blur textarea": "updateAndSave"
  },

  initialize: function () {
    this.users = new BasecampApp.Collections.Users();

    this.model.memberships().each(this.addMembershipSubview.bind(this));
    this.model.uploads().each(this.addUploadSubview.bind(this));
    this.model.completed_tasks().each(this.addTaskSubview.bind(this));
    this.model.incomplete_tasks().each(this.addTaskSubview.bind(this));

    this.listenToOnce(this.model, "sync", this.render);
    this.listenToOnce(this.model, "sync", this.addSideBarSubview);

    this.listenTo(this.model.memberships(), "add", this.addMembershipSubview);
    this.listenTo(this.model.uploads(), "add", this.addUploadSubview);
    this.listenTo(this.model.completed_tasks(), "add", this.addTaskSubview);
    this.listenTo(this.model.incomplete_tasks(), "add", this.addTaskSubview);
    
    this.addNavBarSubview();
    this.addUsersSearchSubview();
  },

  addMembershipSubview: function (membership) {
    var subview = new BasecampApp.Views.MembershipIndexItem({ 
      model: membership,
    });
    this.addSubview(".list-collaborators", subview);
  },

  addNavBarSubview: function () {
    var subview = new BasecampApp.Views.NavBar({
      tagged: false,
      projects: false
    });
    this.addSubview("#backbone-sidebar", subview);
  },

  addSideBarSubview: function () {
    var subview = new BasecampApp.Views.ProjectShowSidebar({
      model: this.model
    });
    this.addSubview("#project-show-sidebar", subview);
  },

  addTaskSubview: function (task) {
    var subview = new BasecampApp.Views.TaskIndexItem({ 
      model: task,
      collection: this.model.completed_tasks()
    });

    if (task.get("status") === "completed") {
      this.addSubview(".tasks-container-body-completed", subview);
    } else {
      this.addSubview(".tasks-container-body-incomplete", subview);
    }
  },

  addTree: function () {
    // excuse my fuck-ugly-ness
    $("#tree-route").empty();
    var project_id = this.model.id;

    var project_link = $('<a href="#">')
      .text(this.model.get("title"))
      .addClass("project-link")
      .prepend('<span class="glyphicon glyphicon-tree-conifer btn-lg" aria-hidden="true"></span>');
    
    var project = $("<li>")
      .append(project_link)
      .append($("<ul>").addClass("nav-task-list pre-scrollable hidden"));

    $("body").find("#tree-route").append(project);
    var $task_list = $(".nav-task-list");

    this.model.incomplete_tasks().forEach(function (task) {
      var title = task.get("title");
      var task_id = task.id;

      // so ugly, i said i'm sorry....
      var task_link = $("<a href='/#projects/" + project_id + "/tasks/" + task_id + "'>")
        .text(title)
        .addClass("tree-list-item")
        .prepend('<span class="glyphicon glyphicon-leaf btn-lg" aria-hidden="true"></span>');
      
      $task_list.append(task_link);
    });
  },

  addUploadSubview: function (upload) {
    var subview = new BasecampApp.Views.UploadsIndexItem({ model: upload });
    this.addSubview(".carousel-inner", subview);
    this.$(".item").first().addClass("active");
  },

  addUsersSearchSubview: function () {
    var subview = new BasecampApp.Views.UsersSearch();
    this.addSubview(".project-user-search", subview);
  },

  toggleActiveFolder: function () {
    $("#div-incomplete").toggleClass("active").toggleClass("inactive");
    $("#div-completed").toggleClass("active").toggleClass("inactive");
  },

  editTitle: function (event) {
    event.preventDefault();
    var $input = $("<input>")
      .addClass("project-title editing")
      .data("attr", "title")
      .data("input", "input")
      .val($(event.currentTarget).html());

    this.$el.find(".project-title").html($input);
    $input.focus();
    this.$el.find(".project-title").removeClass("project-title");
  },

  editDescription: function (event) {
    event.preventDefault();
    var $input = $("<textarea>")
      .addClass("project-description-text editing")
      .data("attr", "description")
      .data("input", "textarea")
      .val($(event.currentTarget).html());

    this.$el.find(".project-description-text").html($input);
    $input.focus();
    this.$el.find(".project-description-text")
      .addClass("project-description-text-editing")
      .removeClass("project-description-text");
  },

  inviteUsers: function (event) {
    event.preventDefault();
    var searchBar = this.$el.find(".project-user-search");
    searchBar.toggleClass("hidden");
    $("body").find(".users-search").usersSearch();

    if (searchBar.hasClass("hidden")) {
      this.$el.find(".project-show-upload-bar").removeClass("hidden");
    } else {
      this.$el.find(".project-show-upload-bar").addClass("hidden");
    }
  },

  newTask: function (event) {
    event.preventDefault();
    var taskForm = new BasecampApp.Views.TaskForm({
      model: new BasecampApp.Models.Task({ project: this.model }),
      project: this.model,
      collection: this.model.incomplete_tasks()
    });
    $("#main").prepend(taskForm.render().$el);
  },

  render: function () { 
    var content = this.template({ project: this.model });
    this.$el.html(content); 
    this.attachSubviews(); 

    setTimeout(function () {
      this.$el.find("#droppable-member").droppable({
        drop: function(event, ui) {
          if ($(ui.draggable[0]).data("task-id") === undefined) {
            var membership = this.model.memberships().get($(ui.draggable[0]).data("id"));
            membership.destroy();
          } else {
            alert("You can only delete project memberships here");
          }
        }.bind(this)
      });

      this.$el.find("#droppable-assignment").droppable({
        drop: function(event, ui) {
          if ($(ui.draggable[0]).data("task-id") === undefined) {
            alert("You can only delete tasks assignments here");
            return;
          }
          var taskId = $(ui.draggable[0]).data("task-id");
          var assignmentId = $(ui.draggable[0]).data("id");

          var task = this.model.incomplete_tasks().get(taskId);
          var assignment = task.assignments().get(assignmentId);

          assignment.destroy();
        }.bind(this)
      });
    }.bind(this), 0);


    this.addTree();

    return this;
  },

  showTree: function (event) {
    event.preventDefault();
    $(".nav-task-list").toggleClass("hidden");
    $("#customer-question").addClass("hidden");
  },

  tagUser: function (event) {
    var userId = $(event.currentTarget).attr("id");
    var attr = { user_id: userId };

    var membership = new BasecampApp.Models.Membership({
      project_id: this.model.id
    });

    membership.save(attr, {
      success: function () {
        this.model.memberships().add(membership, { merge: true });
        this.$el.find(".project-user-search").toggleClass("hidden");
        this.$el.find(".project-show-upload-bar").removeClass("hidden");
      }.bind(this)
    });
  },

  updateAndSave: function (event) {
    var attr = $(event.currentTarget).data("attr");
    var input = $(event.currentTarget).data("input");
    var newAttr = {};
    newAttr[attr] = $("#project-show-main").find(input).val();
    this.model.save(newAttr);

    if (attr === "title") {
      $("h1#project-title").remove("input").addClass("project-title").text(newAttr[attr]);
    } else {
      $("p#description").remove("input").addClass("project-description-text").text(newAttr[attr]);
    }
  },

  upload: function (event) {
    event.preventDefault();
    cloudinary.openUploadWidget(window.CLOUDINARY_SETTINGS, function(error, payload) {
      var attrs = {
        url: payload[0].url,
        thumbnail_url: payload[0].thumbnail_url
      };
      new BasecampApp.Models.Upload({ project: this.model }).save(attrs, {
        success: function () {
          this.model.uploads().fetch();
        }.bind(this)
      });
    }.bind(this));
  }
});