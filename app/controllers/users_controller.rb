class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    # render json: @username
    render "show.json.jbuilder"
  end

  def new
    @user = User.new
    render :new
  end

  def create
    @user = User.new(user_params)

    if @user.save
      log_in(@user)
      redirect_to "/#home"
    else
      flash.now[:errors] = @user.errors.full_messages
      render :new
    end
  end

  def edit
  end

  def update
  end

  def destroy
  end

  def index
    @users = User.all
    render json: @users
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end
end
