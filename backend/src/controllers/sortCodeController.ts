import { Request, Response } from 'express';
import { SortCode } from '../models/SortCode';

exports.getAllSortCodes = async (req: Request, res: Response) => {
  try {
    const sortCodes = await SortCode.findAll();
    res.json(sortCodes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSortCode = async (req: Request, res: Response) => {
  try {
    const newSortCode = await SortCode.create(req.body);
    res.status(201).json(newSortCode);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSortCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await SortCode.update(req.body, { where: { id: id } });

    if (updated) {
      const updatedSortCode = await SortCode.findByPk(id);
      res.json(updatedSortCode);
    } else {
      res.status(404).json({ message: 'Sort code not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSortCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await SortCode.destroy({ where: { id: id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Sort code not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};