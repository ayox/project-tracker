class SessionsController < ApplicationController
  def new
    if current_user
      redirect_to "/#home"
    else 
      @user = User.new
      render :new 
    end
  end

  def create
    user = User.find_by_credentials(
      params[:user][:username],
      params[:user][:password]
    )

    if user
      log_in(user)
      redirect_to "/#home"
    else
      @user = User.new
      flash.now[:errors] = ["Invalid username or password"]
      render :new
    end
  end

  def destroy
    log_out!
    # redirect_to new_session_url
    render body: "hehe, you caught me xP"  # FIX THIS
  end
end
