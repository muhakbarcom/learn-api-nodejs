const bcrypt = require("bcrypt");

class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUsers() {
    try {
      const users = await this.queryAsync(
        "SELECT id, username, name, email, date_of_birth, address, profile_picture FROM user WHERE is_deleted = 0"
      );
      return users;
    } catch (error) {
      throw error;
    }
  }

  async createUser(newUser) {
    try {
      const { username, name, email, password, dateOfBirth, address } = newUser;

      // Check if a user with the same username or email already exists
      const existingUser = await this.getUserByUsernameOrEmail(username, email);

      if (existingUser) {
        throw new Error("Username or email already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt of 10 rounds

      const profilePicture = newUser.profile_picture || null;

      const user = {
        username,
        name,
        email,
        password: hashedPassword, // Store the hashed password
        date_of_birth: dateOfBirth,
        address,
        profile_picture: profilePicture,
      };

      const result = await this.queryAsync("INSERT INTO user SET ?", user);

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(username, updatedUser) {
    try {
      const { name, email, dateOfBirth, address } = updatedUser;

      // Check if the user with the specified username exists
      const existingUser = await this.getUserByUsername(username);

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Update the user data
      const userToUpdate = {
        name,
        email,
        date_of_birth: dateOfBirth,
        address,
      };

      if (updatedUser.profile_picture) {
        userToUpdate.profile_picture = updatedUser.profile_picture;
      }

      await this.queryAsync("UPDATE user SET ? WHERE username = ?", [
        userToUpdate,
        username,
      ]);

      return "User updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.queryAsync(
        "SELECT id, username, name, email, date_of_birth, address, profile_picture FROM user WHERE id = ? AND is_deleted = 0",
        [userId]
      );
      return user[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(username) {
    try {
      // Check if the user with the specified username exists
      const existingUser = await this.getUserByUsername(username);

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Soft delete the user by setting is_deleted to 1
      await this.queryAsync(
        "UPDATE user SET is_deleted = 1 WHERE username = ?",
        username
      );

      return "User soft deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const user = await this.queryAsync(
        "SELECT * FROM user WHERE username = ?",
        username
      );
      return user[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsernameOrEmail(username, email) {
    try {
      const user = await this.queryAsync(
        "SELECT * FROM user WHERE username = ? OR email = ?",
        [username, email]
      );
      return user[0] || null;
    } catch (error) {
      throw error;
    }
  }

  queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
      this.db.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = UserService;
