
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from './firebaseAdmin';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'MacroZone API is running!',
  });
});

// Firebase authentication middleware
const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    res.locals.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

// GET: Retrieve authenticated user's meals
app.get(
  '/api/meals',
  authenticateUser,
  async (_req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;

      const snapshot = await adminDb
        .collection('users')
        .doc(uid)
        .collection('meals')
        .orderBy('createdAt', 'desc')
        .get();

      const meals = snapshot.docs.map((mealDoc) => ({
        id: mealDoc.id,
        ...mealDoc.data(),
      }));

      res.json({
        success: true,
        count: meals.length,
        meals,
      });
    } catch (error) {
      console.error('Error fetching meals:', error);

      res.status(500).json({
        success: false,
        message: 'Could not retrieve meals.',
      });
    }
  }
);

// POST: Add a meal
app.post(
  '/api/meals',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;

      const {
        name,
        calories,
        protein = 0,
        carbs = 0,
        fat = 0,
      } = req.body;

      if (
        typeof name !== 'string' ||
        !name.trim() ||
        ![calories, protein, carbs, fat].every(
          (value) =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0
        )
      ) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid meal name and nutrition values.',
        });
        return;
      }

      const meal = {
        name: name.trim(),
        calories,
        protein,
        carbs,
        fat,
        createdAt: new Date().toISOString(),
      };

      const docRef = await adminDb
        .collection('users')
        .doc(uid)
        .collection('meals')
        .add(meal);

      res.status(201).json({
        success: true,
        message: 'Meal added successfully.',
        meal: {
          id: docRef.id,
          ...meal,
        },
      });
    } catch (error) {
      console.error('Error adding meal:', error);

      res.status(500).json({
        success: false,
        message: 'Could not add meal.',
      });
    }
  }
);

// GET: Retrieve one meal
app.get(
  '/api/meals/:id',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;
      const mealId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const mealDoc = await adminDb
        .collection('users')
        .doc(uid)
        .collection('meals')
        .doc(mealId)
        .get();

      if (!mealDoc.exists) {
        res.status(404).json({
          success: false,
          message: 'Meal not found.',
        });
        return;
      }

      res.json({
        success: true,
        meal: {
          id: mealDoc.id,
          ...mealDoc.data(),
        },
      });
    } catch (error) {
      console.error('Error fetching meal:', error);

      res.status(500).json({
        success: false,
        message: 'Could not retrieve meal.',
      });
    }
  }
);


 // PUT: Update an existing meal
app.put(
  '/api/meals/:id',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;
      const mealId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const { name, calories, protein, carbs, fat } = req.body;

      if (
        typeof name !== 'string' ||
        !name.trim() ||
        ![calories, protein, carbs, fat].every(
          (value) =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0
        )
      ) {
        res.status(400).json({
          success: false,
          message: 'Please provide valid meal details.',
        });
        return;
      }

      const mealRef = adminDb
        .collection('users')
        .doc(uid)
        .collection('meals')
        .doc(mealId);

      const mealDoc = await mealRef.get();

      if (!mealDoc.exists) {
        res.status(404).json({
          success: false,
          message: 'Meal not found.',
        });
        return;
      }

      const updatedMeal = {
        name: name.trim(),
        calories,
        protein,
        carbs,
        fat,
      };

      await mealRef.update(updatedMeal);

      res.json({
        success: true,
        message: 'Meal updated successfully.',
        meal: {
          id: mealId,
          ...mealDoc.data(),
          ...updatedMeal,
        },
      });
    } catch (error) {
      console.error('Error updating meal:', error);

      res.status(500).json({
        success: false,
        message: 'Could not update meal.',
      });
    }
  }
);


// DELETE: Delete one meal
app.delete(
  '/api/meals/:id',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;
      const mealId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const mealRef = adminDb
        .collection('users')
        .doc(uid)
        .collection('meals')
        .doc(mealId);

      const mealDoc = await mealRef.get();

      if (!mealDoc.exists) {
        res.status(404).json({
          success: false,
          message: 'Meal not found.',
        });
        return;
      }

      await mealRef.delete();

      res.json({
        success: true,
        message: 'Meal deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting meal:', error);

      res.status(500).json({
        success: false,
        message: 'Could not delete meal.',
      });
    }
  }
);


// DELETE: Clear all meals for the authenticated user
app.delete(
  '/api/meals',
  authenticateUser,
  async (_req: Request, res: Response) => {
    try {
      const uid = res.locals.uid as string;

      const mealsRef = adminDb
        .collection('users')
        .doc(uid)
        .collection('meals');

      const snapshot = await mealsRef.get();

      if (snapshot.empty) {
        res.json({
          success: true,
          message: 'No meals to delete.',
          deletedCount: 0,
        });
        return;
      }

      // Firestore batches support a maximum of 500 operations.
      const docs = snapshot.docs;
      let deletedCount = 0;

      for (let i = 0; i < docs.length; i += 500) {
        const batch = adminDb.batch();
        const chunk = docs.slice(i, i + 500);

        chunk.forEach((mealDoc) => {
          batch.delete(mealDoc.ref);
        });

        await batch.commit();
        deletedCount += chunk.length;
      }

      res.json({
        success: true,
        message: 'All meals deleted successfully.',
        deletedCount,
      });
    } catch (error) {
      console.error('Error clearing meals:', error);

      res.status(500).json({
        success: false,
        message: 'Could not clear meals.',
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`MacroZone API running on port ${PORT}`);
});
