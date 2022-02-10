[HttpGet("getJournalReport/{pageNumber}/{take}")]
        public async Task<ActionResult<IEnumerable<ViewReportJournal>>> GetJournalReport(int pageNumber, int take, string? startDate, string? endDate)
        {
            var query = $"select * from [dbo].[ViewReportJournal] ";

            if (string.IsNullOrEmpty(startDate) == false || string.IsNullOrEmpty(endDate) == false)
            {
                string _startDate = null;
                string _endDate = null;
                if (string.IsNullOrEmpty(startDate) == false)
                    _startDate = (new DateTime(1970, 1, 1)).AddMilliseconds(long.Parse(startDate)).ToString("dd.MM.yyyy");
                if (string.IsNullOrEmpty(endDate) == false)
                    _endDate = (new DateTime(1970, 1, 1)).AddMilliseconds(long.Parse(endDate)).ToString("dd.MM.yyyy");


                if (string.IsNullOrEmpty(startDate) == false && string.IsNullOrEmpty(endDate) == true)
                {
                    query += $"where Convert(date, Date, 104) >= Convert(date, '{ _startDate }', 104)";
                }
                else if (string.IsNullOrEmpty(endDate) == false && string.IsNullOrEmpty(startDate) == true)
                {
                    query += $"where Convert(date, Date, 104) <= Convert(date, '{ _endDate  }', 104)";
                }
                else if (string.IsNullOrEmpty(startDate) == false && string.IsNullOrEmpty(endDate) == false)
                {
                    query += $"where Convert(date, Date, 104) between Convert(date, '{ _startDate }', 104) and Convert(date, '{ _endDate }', 104)";
                }
            }

            return await _context.ViewReportJournal.FromSqlRaw(query)
                    .OrderByDescending(p => p.Date)
                    .Skip(take * (pageNumber - 1))
                    .Take(take)
                    .ToListAsync(); ;
        }