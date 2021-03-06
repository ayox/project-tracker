module ApplicationHelper
  def seed_new_user(user)
    project = Project.create!(
      owner_id: user.id, 
      title: "Demo Project!", 
      description: "Click here for more info."
    )

    seed_new_project(project, user)

    nil
  end

  def seed_new_project(project, user)
    Membership.create!(user_id: 1, project_id: project.id)
    Membership.create!(user_id: 2, project_id: project.id)
    Membership.create!(user_id: 3, project_id: project.id)
    
    task1 = Task.create!(
      author_id: user.id,
      project_id: project.id,
      title: "First Task!",
      body: "Hello! We're here to get you started! Drag anyone to any task to create an assignment!"
    )

    task2 = Task.create!(
      author_id: user.id,
      project_id: project.id,
      title: "Second Task!",
      body: "If they're not doing a good job, drag them to the X to remove them from task"
    )

    task3 = Task.create!(
      author_id: user.id,
      project_id: project.id,
      title: "Last Task!",
      body: "If they REALLY suck, kick them out of the project. Drag them from the bar to the X to remove them from the project"
    )

    task4 = Task.create!(
      author_id: user.id,
      project_id: project.id,
      title: "Create New Task!",
      body: "Great job! Now mark this complete and watch your incomplete tasks get shorter!"
    )

    AssignedTask.create!(
      user_id: 1,
      task_id: task1.id
    )

    AssignedTask.create!(
      user_id: 3,
      task_id: task1.id
    )

    AssignedTask.create!(
      user_id: 2,
      task_id: task2.id
    )

    AssignedTask.create!(
      user_id: 1,
      task_id: task3.id
    )

    AssignedTask.create!(
      user_id: user.id,
      task_id: task4.id
    )

    nil
  end
end
