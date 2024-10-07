export const getDetailReport = async (req, res) => {
    try {
      const { id } = req.body;
      const result = await db.query(`SELECT * FROM reports WHERE id = $1`, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };