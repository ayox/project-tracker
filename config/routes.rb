Rails.application.routes.draw do
  root to: 'static_pages#root'

  namespace :api, defaults: { format: :json } do
    resources :projects
    resources :memberships, only: [:create, :index, :destroy]
    resources :uploads, except: [:new, :edit, :update]
    resources :tasks
    resources :assigned_tasks
  end

  resource :session, only: [:new, :create, :destroy]
  resources :users
end
