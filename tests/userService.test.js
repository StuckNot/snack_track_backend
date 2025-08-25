  describe('User Search Functionality', () => {
    beforeEach(async () => {
      // Create test users with different combinations of attributes
      await User.bulkCreate([
        {
          name: 'John Doe',
          email: 'john@test.com',
          password: 'password123',
          health_goals: 'lose_weight',
          dietary_preferences: 'veg',
          allergies: ['nuts', 'dairy'],
          is_active: true
        },
        {
          name: 'Jane Smith',
          email: 'jane@test.com',
          password: 'password123',
          health_goals: 'gain_muscle',
          dietary_preferences: 'veg',
          allergies: ['shellfish'],
          is_active: true
        },
        {
          name: 'Bob Wilson',
          email: 'bob@test.com',
          password: 'password123',
          health_goals: 'lose_weight',
          dietary_preferences: 'non_veg',
          allergies: ['nuts'],
          is_active: true
        }
      ]);
    });

    it('should filter by single criterion', async () => {
      const result = await userService.searchUsers({ health_goal: 'lose_weight' });
      
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.users.every(user => user.health_goals === 'lose_weight')).toBe(true);
    });

    it('should combine multiple filters correctly', async () => {
      const result = await userService.searchUsers({ 
        health_goal: 'lose_weight',
        dietary_preference: 'veg'
      });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe('John Doe');
      expect(result.total).toBe(1);
    });

    it('should filter by allergy using array containment', async () => {
      const result = await userService.searchUsers({ allergy: 'nuts' });
      
      expect(result.users).toHaveLength(2);
      expect(result.users.every(user => user.allergies.includes('nuts'))).toBe(true);
    });

    it('should combine all three filter types', async () => {
      const result = await userService.searchUsers({
        health_goal: 'lose_weight',
        dietary_preference: 'non_veg',
        allergy: 'nuts'
      });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe('Bob Wilson');
    });

    it('should handle pagination correctly', async () => {
      const result = await userService.searchUsers({ limit: 2, offset: 0 });
      
      expect(result.users).toHaveLength(2);
      expect(result.limit).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.hasMore).toBe(true);
    });

    it('should return empty results when no matches found', async () => {
      const result = await userService.searchUsers({ health_goal: 'nonexistent' });
      
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });